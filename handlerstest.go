// +build debug

package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func handlerMain(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		handlerNotFound(w, r)
	} else if base.connections[0].client.IsConnected() {
		handleFileRequest(w, "./src/index.html", "text/html")
	} else {
		handleFileRequest(w, "./src/waiting.html", "text/html")
	}
}

func handlerJsBundle(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./build/bundle.js", "text/javascript")
}

func handlerFaviconIco(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/favicon.ico", "image/x-icon")
}

func handlerSiriDBLargePNG(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/img/siridb-large.png", "image/png")
}

func handlerSiriDBSmallPNG(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/img/siridb-small.png", "image/png")
}

func handlerLoaderGIF(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/img/loader.gif", "image/gif")
}

func handleFileRequest(w http.ResponseWriter, fn, ct string) {
	b, err := ioutil.ReadFile(fn)
	if err == nil {
		w.Header().Set("Content-Type", ct)
		_, err = w.Write(b)
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		_, err = fmt.Fprintf(w, "Internal server error: %s", err)
	}
	if err != nil {
		fmt.Println(err)
	}
}

func init() {
	fmt.Println("# DEBUG MODE: using original template files...")
}
