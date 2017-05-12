package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
	ini "gopkg.in/ini.v1"
)

// AppVersion exposes version information
const AppVersion = "2.0.0"

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

}
