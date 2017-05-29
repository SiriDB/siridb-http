package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"time"

	"github.com/astaxie/beego/session"
	siridb "github.com/transceptor-technology/go-siridb-connector"
	"github.com/transceptor-technology/go-socket.io"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
	ini "gopkg.in/ini.v1"
)

// AppVersion exposes version information
const AppVersion = "2.0.0"

const retryConnectTime = 5

// Conn is used to store the user/password with the client.
type Conn struct {
	user     string
	password string
	client   *siridb.Client
}

type store struct {
	connections     []Conn
	dbname          string
	timePrecision   string
	version         string
	servers         []server
	port            uint16
	insertTimeout   uint16
	logCh           chan string
	reqAuth         bool
	multiUser       bool
	enableWeb       bool
	enableSio       bool
	enableSSL       bool
	enableBasicAuth bool
	ssessions       map[string]string
	cookieMaxAge    uint64
	crtFile         string
	keyFile         string
	gsessions       *session.Manager
}

type server struct {
	host string
	port uint16
}

var (
	xApp     = kingpin.New("siridb-http", "Provides a HTTP API and optional web interface for SiriDB.")
	xConfig  = xApp.Flag("config", "Configuration and connection file for SiriDB HTTP.").Default("").Short('c').String()
	xVerbose = xApp.Flag("verbose", "Enable verbose logging.").Bool()
	xVersion = xApp.Flag("version", "Print version information and exit.").Short('v').Bool()
)

var base = store{}

func getHostAndPort(addr string) (server, error) {
	parts := strings.Split(addr, ":")
	// IPv4
	if len(parts) == 1 {
		return server{parts[0], 9000}, nil
	}
	if len(parts) == 2 {
		u, err := strconv.ParseUint(parts[1], 10, 16)
		return server{parts[0], uint16(u)}, err
	}
	// IPv6
	if addr[0] != '[' {
		return server{fmt.Sprintf("[%s]", addr), 9000}, nil
	}
	if addr[len(addr)-1] == ']' {
		return server{addr, 9000}, nil
	}
	u, err := strconv.ParseUint(parts[len(parts)-1], 10, 16)
	addr = strings.Join(parts[:len(parts)-1], ":")

	return server{addr, uint16(u)}, err
}

func getServers(addrstr string) ([]server, error) {
	arr := strings.Split(addrstr, ",")
	servers := make([]server, len(arr))
	for i, addr := range arr {
		addr = strings.TrimSpace(addr)
		server, err := getHostAndPort(addr)
		if err != nil {
			return nil, err
		}
		servers[i] = server
	}
	return servers, nil
}

func serversToInterface(servers []server) [][]interface{} {
	ret := make([][]interface{}, len(servers))
	for i, svr := range servers {
		ret[i] = make([]interface{}, 2)
		ret[i][0] = svr.host
		ret[i][1] = int(svr.port)
	}
	return ret
}

func logHandle(logCh chan string) {
	for {
		msg := <-logCh
		if *xVerbose {
			println(msg)
		}
	}
}

func sigHandle(sigCh chan os.Signal) {
	for {
		<-sigCh
		quit(nil)
	}
}

func quit(err error) {
	rc := 0
	if err != nil {
		fmt.Printf("%s\n", err)
		rc = 1
	}

	for _, conn := range base.connections {
		if conn.client != nil {
			conn.client.Close()
		}
	}

	os.Exit(rc)
}

func connect(conn Conn) {
	for !conn.client.IsConnected() {
		base.logCh <- fmt.Sprintf("not connected to SiriDB, try again in %d seconds", retryConnectTime)
		time.Sleep(retryConnectTime * time.Second)
	}
	res, err := conn.client.Query("show time_precision, version", 10)
	if err != nil {
		quit(err)
	}
	v, ok := res.(map[string]interface{})
	if !ok {
		quit(fmt.Errorf("missing 'map' in data"))
	}

	arr, ok := v["data"].([]interface{})
	if !ok || len(arr) != 2 {
		quit(fmt.Errorf("missing array 'data' or length 2 in map"))
	}

	base.timePrecision, ok = arr[0].(map[string]interface{})["value"].(string)
	base.version, ok = arr[1].(map[string]interface{})["value"].(string)

	if !ok {
		quit(fmt.Errorf("cannot find time_precision and/or version in data"))
	}
}

func readBool(section *ini.Section, key string) (b bool) {
	if bIni, err := section.GetKey(key); err != nil {
		quit(err)
	} else if b, err = bIni.Bool(); err != nil {
		quit(err)
	}
	return b
}

func readString(section *ini.Section, key string) (s string) {
	if sIni, err := section.GetKey(key); err != nil {
		quit(err)
	} else {
		s = sIni.String()
	}
	return s
}

func main() {

	// parse arguments
	_, err := xApp.Parse(os.Args[1:])
	if err != nil {
		quit(err)
	}

	if *xVersion {
		fmt.Printf("Version: %s\n", AppVersion)
		os.Exit(0)
	}

	if *xConfig == "" {
		fmt.Printf(
			`# SiriDB HTTP Configuration file
[Database]
# User with at least 'show' privileges.
user = <your_username>

# A password is required. To protect the password this file should be placed in
# a folder where unauthorized users have no access.
password = <your_password>

# Database to connect to.
dbname = <your_database>

# Multiple servers are allowed and should be comma separated. When a port
# is not provided the default 9000 is used. IPv6 address are supported and
# should be wrapped in square brackets [] in case an alternative port is
# required. SiriDB HTTP will randomly select an available siridb server
# for each request.
#
# Valid examples:
#   siridb01.local,siridb02.local,siridb03.local,siridb04.local
#   10.20.30.40
#   [::1]:5050,[::1]:5051
#   2001:0db8:85a3:0000:0000:8a2e:0370:7334
servers = localhost:9000

[Configuration]
# Listening to TCP port.
port = 5050

# When disabled no authentication is required. When enabled session
# authentication or basic authentication is required.
require_authentication = True

# When enabled /socket.io/ will be enabled and Socket-IO can be used as an
# alternative to the standard http rest api.
enable_socket_io = True

# When enabled the crt_file and key_file must be configured and the server
# will be hosted on https.
enable_ssl = False

# When enabled a website is hosted on the configured port. When disabled the
# resource URIs like /query, /insert, /auth/.. etc. are still available.
enable_web = True

# When enabled the /query and /insert resource URIs can be used with basic
# authentication.
enable_basic_auth = False

# When multi user is disabled, only the user/password combination provided in
# this configuration file can be used.
enable_multi_user = False

# Cookie max age is used to set the cookie expiration time in seconds.
cookie_max_age = 604800

# The query api allows you to specify a timeout for each query, but the insert
# api only accepts data. Therefore the insert timeout is set as a general
# value and is applicable to each insert.
insert_timeout = 60

[SSL]
# Self-signed certificates can be created with the following command:
#
#   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#        -keyout certificate.key -out certificate.crt
#
crt_file = certificate.crt
key_file = certificate.key

#
# Welcome and thank you for using SiriDB!
#
# A configuration file is required and shoud be provided with the
#   --config <file> argument.
# Above you find an example template which can be used.
#

`)
		os.Exit(0)
	}

	var conn Conn

	cfg, err := ini.Load(*xConfig)
	if err != nil {
		quit(err)
	}

	section, err := cfg.GetSection("Database")
	if err != nil {
		quit(err)
	}

	base.servers, err = getServers(readString(section, "servers"))
	if err != nil {
		quit(err)
	}

	base.dbname = readString(section, "dbname")
	conn.user = readString(section, "user")
	conn.password = readString(section, "password")

	base.logCh = make(chan string)
	go logHandle(base.logCh)

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt)
	go sigHandle(sigCh)

	conn.client = siridb.NewClient(
		conn.user,                        // user
		conn.password,                    // password
		base.dbname,                      // database
		serversToInterface(base.servers), // siridb server(s)
		base.logCh,                       // optional log channel
	)
	base.connections = append(base.connections, conn)
	base.ssessions = make(map[string]string)

	section, err = cfg.GetSection("Configuration")
	if err != nil {
		quit(err)
	}

	base.reqAuth = readBool(section, "require_authentication")
	base.enableWeb = readBool(section, "enable_web")
	base.enableSio = readBool(section, "enable_socket_io")
	base.enableSSL = readBool(section, "enable_ssl")
	base.multiUser = readBool(section, "enable_multi_user")
	base.enableBasicAuth = readBool(section, "enable_basic_auth")

	if portIni, err := section.GetKey("port"); err != nil {
		quit(err)
	} else if port64, err := portIni.Uint64(); err != nil {
		quit(err)
	} else {
		base.port = uint16(port64)
	}

	if cookieMaxAgeIni, err := section.GetKey("cookie_max_age"); err != nil {
		quit(err)
	} else if base.cookieMaxAge, err = cookieMaxAgeIni.Uint64(); err != nil {
		quit(err)
	}

	if insertTimeoutIni, err := section.GetKey("insert_timeout"); err != nil {
		quit(err)
	} else if insertTimeout64, err := insertTimeoutIni.Uint64(); err != nil {
		quit(err)
	} else {
		base.insertTimeout = uint16(insertTimeout64)
	}

	if base.enableSSL {
		section, err = cfg.GetSection("SSL")
		if err != nil {
			quit(err)
		}
		base.crtFile = readString(section, "crt_file")
		base.keyFile = readString(section, "key_file")
	}

	http.HandleFunc("*", handlerNotFound)

	if base.enableWeb {
		http.HandleFunc("/", handlerMain)
		http.HandleFunc("/js/bundle", handlerJsBundle)
		http.HandleFunc("/js/jsleri", handlerLeriMinJS)
		http.HandleFunc("/js/grammar", handlerGrammarJS)
		http.HandleFunc("/css/bootstrap", handlerBootstrapCSS)
		http.HandleFunc("/css/layout", handlerLayout)
		http.HandleFunc("/favicon.ico", handlerFaviconIco)
		http.HandleFunc("/img/siridb-large.png", handlerSiriDBLargePNG)
		http.HandleFunc("/img/siridb-small.png", handlerSiriDBSmallPNG)
		http.HandleFunc("/img/loader.gif", handlerLoaderGIF)
		http.HandleFunc("/css/font-awesome.min.css", handlerFontAwesomeMinCSS)
		http.HandleFunc("/fonts/FontAwesome.otf", handlerFontsFaOTF)
		http.HandleFunc("/fonts/fontawesome-webfont.eot", handlerFontsFaEOT)
		http.HandleFunc("/fonts/fontawesome-webfont.svg", handlerFontsFaSVG)
		http.HandleFunc("/fonts/fontawesome-webfont.ttf", handlerFontsFaTTF)
		http.HandleFunc("/fonts/fontawesome-webfont.woff", handlerFontsFaWOFF)
		http.HandleFunc("/fonts/fontawesome-webfont.woff2", handlerFontsFaWOFF2)
	}

	http.HandleFunc("/db-info", handlerDbInfo)
	http.HandleFunc("/auth/fetch", handlerAuthFetch)
	http.HandleFunc("/query", handlerQuery)
	http.HandleFunc("/insert", handlerInsert)

	cf := new(session.ManagerConfig)
	cf.EnableSetCookie = true
	s := fmt.Sprintf(`{"cookieName":"siridbadminsessionid","gclifetime":%d}`, base.cookieMaxAge)

	if err = json.Unmarshal([]byte(s), cf); err != nil {
		quit(err)
	}

	if base.gsessions, err = session.NewManager("memory", cf); err != nil {
		quit(err)
	}

	go base.gsessions.GC()
	http.HandleFunc("/auth/login", handlerAuthLogin)
	http.HandleFunc("/auth/logout", handlerAuthLogout)

	conn.client.Connect()
	go connect(conn)

	if base.enableSio {
		server, err := socketio.NewServer(nil)
		if err != nil {
			quit(err)
		}

		server.On("connection", func(so socketio.Socket) {
			so.On("db-info", func(_ string) (int, string) {
				return onDbInfo(&so)
			})
			so.On("auth fetch", func(_ string) (int, string) {
				return onAuthFetch(&so)
			})
			so.On("auth login", func(req tAuthLoginReq) (int, string) {
				return onAuthLogin(&so, &req)
			})
			so.On("auth logout", func(_ string) (int, string) {
				return onAuthLogout(&so)
			})
			so.On("query", func(req tQuery) (int, string) {
				return onQuery(&so, &req)
			})
			so.On("insert", func(req interface{}) (int, string) {
				return onInsert(&so, &req)
			})
			so.On("disconnection", func() {
				delete(base.ssessions, so.Id())
			})
		})

		server.On("error", func(so socketio.Socket, err error) {
			log.Println("error:", err)
		})

		http.Handle("/socket.io/", server)
	}

	msg := "Serving SiriDB API on http%s://127.0.0.1:%d\n"
	if base.enableSSL {
		fmt.Printf(msg, "s", base.port)
		if err = http.ListenAndServeTLS(
			fmt.Sprintf(":%d", base.port),
			base.crtFile,
			base.keyFile,
			nil); err != nil {
			fmt.Printf("error: %s\n", err)
		}
	} else {
		fmt.Printf(msg, "", base.port)
		if err = http.ListenAndServe(fmt.Sprintf(":%d", base.port), nil); err != nil {
			fmt.Printf("error: %s\n", err)
		}
	}
	quit(nil)
}
