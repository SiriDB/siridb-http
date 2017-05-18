package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"

	"github.com/astaxie/beego/session"
	"github.com/googollee/go-socket.io"
	siridb "github.com/transceptor-technology/go-siridb-connector"

	"time"

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
	connections   []Conn
	dbname        string
	timePrecision string
	version       string
	servers       []server
	port          uint16
	logCh         chan string
	reqAuth       bool
	multiUser     bool
	ssessions     map[string]string
}

type server struct {
	host string
	port uint16
}

var (
	xApp     = kingpin.New("siridb-http", "Provides a HTTP API and optional web interface for SiriDB.")
	xConfig  = xApp.Flag("config", "Configuration and connection file for SiriDB HTTP.").Default("").Short('c').String()
	xVerbose = xApp.Flag("verbose", "Enable verbose logging.").Bool()
	xVersion = xApp.Flag("version", "Print version information and exit.").Bool()
)

var base = store{}

var globalSessions *session.Manager

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
		println("CTRL+C pressed...")
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
user = <user>
password = <password>
dbname = <database name>
# Multiple servers are possible and should be comma separated. When a port
# is not provided the default port 9000 is used. IPv6 addresses are supported
# and should be wrapped in square brackets [] in case an alternative port is
# required.
servers = <host:port>

[Configuration]
port = 5050
enable_web = True
enable_ssl = False
# session authentication will be enabled when set to True
require_authentication = True

[Session]
cookie_max_age = 604800
# When multi user is disabled, only the user/password combination provided in
# this configuration file can be used to create a session connection to SiriDB.
enable_multi_user = False

[Secret]
# When a secret is specified, the /query and /insert POST request can be used
# by providing the secret inside the header of each request. This method can be
# used as an alternative to using sessions.
secret = my_super_secret

[SSL]
# Self-signed certificates can be created using:
#
#   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#        -keyout certificate.key -out certificate.crt
#
crt_file = my_certificate.crt
key_file = my_certificate.key

#
# Welcome and thank you for using SiriDB!
#
# A configuration file is required and shoud be provided with the --config <file> argument.
# Above you find an example template which can used.
#

`)
		os.Exit(0)
	}

	cfg, err := ini.Load(*xConfig)
	if err != nil {
		quit(err)
	}

	section, err := cfg.GetSection("Database")
	if err != nil {
		quit(err)
	}

	user, err := section.GetKey("user")
	if err != nil {
		quit(err)
	}

	password, err := section.GetKey("password")
	if err != nil {
		quit(err)
	}

	dbname, err := section.GetKey("dbname")
	if err != nil {
		quit(err)
	}

	addrstr, err := section.GetKey("servers")
	if err != nil {
		quit(err)
	}

	servers, err := getServers(addrstr.String())
	if err != nil {
		quit(err)
	}

	base.logCh = make(chan string)
	go logHandle(base.logCh)

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt)
	go sigHandle(sigCh)

	base.dbname = dbname.String()

	var conn Conn
	conn.user = user.String()
	conn.password = password.String()
	conn.client = siridb.NewClient(
		conn.user,                   // user
		conn.password,               // password
		base.dbname,                 // database
		serversToInterface(servers), // siridb server(s)
		base.logCh,                  // optional log channel
	)
	base.connections = append(base.connections, conn)

	section, err = cfg.GetSection("HTTP")
	if err != nil {
		quit(err)
	}

	portIni, err := section.GetKey("port")
	if err != nil {
		quit(err)
	}

	port64, err := portIni.Uint64()
	if err != nil {
		quit(err)
	}

	base.port = uint16(port64)

	enableWebIni, err := section.GetKey("enable_web")
	if err != nil {
		quit(err)
	}

	enableWeb, err := enableWebIni.Bool()
	if err != nil {
		quit(err)
	}

	section, err = cfg.GetSection("Configuration")
	if err != nil {
		quit(err)
	}

	reqAuthIni, err := section.GetKey("require_authentication")
	if err != nil {
		quit(err)
	}

	base.reqAuth, err = reqAuthIni.Bool()
	if err != nil {
		quit(err)
	}

	multiUserIni, err := section.GetKey("enable_multi_user")
	if err != nil {
		quit(err)
	}

	base.multiUser, err = multiUserIni.Bool()
	if err != nil {
		quit(err)
	}

	section, err = cfg.GetSection("Session")
	if err != nil {
		quit(err)
	}

	http.HandleFunc("*", handlerNotFound)

	if enableWeb {
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

	if base.reqAuth {
		cf := new(session.ManagerConfig)
		cf.EnableSetCookie = true
		s := `{"cookieName":"siridbadminsessionid","gclifetime":3600}`

		if err = json.Unmarshal([]byte(s), cf); err != nil {
			quit(err)
		}

		if globalSessions, err = session.NewManager("memory", cf); err != nil {
			quit(err)
		}

		go globalSessions.GC()
		http.HandleFunc("/auth/login", handlerAuthLogin)
		http.HandleFunc("/auth/logoff", handlerAuthLogoff)
	}

	conn.client.Connect()
	go connect(conn)

	server, err := socketio.NewServer(nil)
	if err != nil {
		quit(err)
	}
	server.On("connection", func(so socketio.Socket) {

		fmt.Printf("on connection, id: %s\n", so.Id())

		// so.Join("chat")
		so.On("auth fetch", onAuthFetch)
		// 	log.Println("emit:", so.Emit("chat message", msg))
		// 	so.BroadcastTo("chat", "chat message", msg)
		// })
		so.On("disconnection", func(so socketio.Socket) {
			fmt.Printf("on disconnection, id: %s\n", so.Id())
		})
	})

	server.On("error", func(so socketio.Socket, err error) {
		fmt.Println("error:", err)
	})

	http.Handle("/socket.io/", server)

	fmt.Printf("Serving SiriDB HTTP API on port %d\nPress CTRL+C to quit\n", base.port)
	if err = http.ListenAndServe(fmt.Sprintf(":%d", base.port), nil); err != nil {
		fmt.Printf("error: %s\n", err)
	}
}
