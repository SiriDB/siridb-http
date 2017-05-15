package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"

	siridb "github.com/transceptor-technology/go-siridb-connector"

	"time"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
	ini "gopkg.in/ini.v1"
)

// AppVersion exposes version information
const AppVersion = "2.0.0"

const retryConnectTime = 5

type settings struct {
	user          string
	password      string
	dbname        string
	timePrecision string
	version       string
	servers       []server
	port          uint16
	logCh         chan string
	client        *siridb.Client
}

type server struct {
	host string
	port uint16
}

var (
	xApp     = kingpin.New("siridb-http", "Provides a HTTP API and optional web interface for SiriDB.")
	xConfig  = xApp.Flag("config", "").Short('c').String()
	xVerbose = xApp.Flag("verbose", "Enable verbose logging.").Bool()
	xVersion = xApp.Flag("version", "Print version information and exit.").Bool()
)

var base = settings{}

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

	if base.client != nil {
		base.client.Close()
	}

	os.Exit(rc)
}

func connect() {
	for !base.client.IsConnected() {
		base.logCh <- fmt.Sprintf("not connected to SiriDB, try again in %d seconds", retryConnectTime)
		time.Sleep(retryConnectTime * time.Second)
	}
	res, err := base.client.Query("show time_precision, version", 10)
	if err != nil {
		quit(err)
	}
	v, ok := res.(map[interface{}]interface{})
	if !ok {
		quit(fmt.Errorf("missing 'map' in data"))
	}

	arr, ok := v["data"].([]interface{})
	if !ok || len(arr) != 2 {
		quit(fmt.Errorf("missing array 'data' or length 2 in map"))
	}

	base.timePrecision, ok = arr[0].(map[interface{}]interface{})["value"].(string)
	base.version, ok = arr[1].(map[interface{}]interface{})["value"].(string)

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
			`#
# A configuration file is required and shoud be provided with the --config <file> argument.
# This is a configuration file template which can be saved and used:
#

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
# authentication shoud be either "None", "Secret", "Session" or "Both".
authentication_methods = Both

[Session]
cookie_max_age = 604800
# When multi user is disabled, only the user/password combination provided in
# this configuration file can be used to create a session connection to SiriDB.
enable_multi_user = False

[Secret]
# When "Secret" authentication is enabled,
secret = my_super_secret

[SSL]
# Self-signed certificates can be created using:
#
#   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#        -keyout certificate.key -out certificate.crt
#
crt_file = my_certificate.crt
key_file = my_certificate.key
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

	base.user = user.String()
	base.password = password.String()
	base.dbname = dbname.String()

	base.client = siridb.NewClient(
		base.user,                   // username
		base.password,               // password
		base.dbname,                 // database
		serversToInterface(servers), // siridb server(s)
		base.logCh,                  // optional log channel
	)

	section, err = cfg.GetSection("Configuration")
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

	base.client.Connect()
	go connect()

	fmt.Printf("Serving SiriDB HTTP API on port %d\nPress CTRL+C to quit\n", base.port)
	if err = http.ListenAndServe(fmt.Sprintf(":%d", base.port), nil); err != nil {
		fmt.Printf("error: %s\n", err)
	}
}
