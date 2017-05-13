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
	user     string
	password string
	dbname   string
	servers  []server
	port     uint16
	logCh    chan string
	client   *siridb.Client
}

type server struct {
	host string
	port uint16
}

var (
	xApp     = kingpin.New("siridb-http", "Provides a HTTP API and optional web interface for SiriDB.")
	xConfig  = xApp.Flag("config", "").Short('c').Default("/etc/siridb/siridb-http.conf").String()
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
		os.Exit(0)
	}
}

func quit(err error) {
	fmt.Printf("%s\n", err)
	if base.client != nil {
		base.client.Close()
	}
	os.Exit(1)
}

func connect() {
	for !base.client.IsConnected() {
		base.logCh <- fmt.Sprintf("not connected to SiriDB, try again in %d seconds", retryConnectTime)
		time.Sleep(retryConnectTime * time.Second)
	}
	res, err := base.client.Query("show version", 10)
	if err != nil {
		quit(err)
	}
	println("here...")
	base.logCh <- fmt.Sprint(res)

}

func main() {

	// parse arguments
	_, err := xApp.Parse(os.Args[1:])

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	if *xVersion {
		fmt.Printf("Version: %s\n", AppVersion)
		os.Exit(0)
	}

	cfg, err := ini.Load(*xConfig)

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	section, err := cfg.GetSection("Database")

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	user, err := section.GetKey("user")

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	fmt.Printf("User: %s\n", user)

	password, err := section.GetKey("password")

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	fmt.Printf("Password: %s\n", password)

	dbname, err := section.GetKey("dbname")

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	fmt.Printf("Database: %s\n", dbname)

	addrstr, err := section.GetKey("servers")

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	fmt.Printf("Servers (str): %s\n", addrstr)

	servers, err := getServers(addrstr.String())

	if err != nil {
		fmt.Printf("%s\n", err)
		os.Exit(1)
	}

	fmt.Printf("Servers (obj): %v\n", servers)

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

	portini, err := section.GetKey("port")
	if err != nil {
		quit(err)
	}

	port64, err := portini.Uint64()
	if err != nil {
		quit(err)
	}

	base.port = uint16(port64)

	fmt.Printf("Port: %d\n", base.port)

	http.HandleFunc("/db-info", handlerDbInfo)

	base.client.Connect()
	go connect()

	fmt.Printf("Serving SiriDB HTTP API on port %d\nPress CTRL+C to quit\n", base.port)
	if err = http.ListenAndServe(fmt.Sprintf(":%d", base.port), nil); err != nil {
		fmt.Printf("error: %s\n", err)
	}

}
