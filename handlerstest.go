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
	} else if base.client.IsConnected() {
		handleFileRequest(w, "./src/index.html")
	} else {
		handleFileRequest(w, "./src/waiting.html")
	}
}

func handlerJsBundle(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./build/bundle.js")
}

func handlerFaviconIco(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/favicon.ico")
}

func handlerBootstrapCSS(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/css/bootstrap.css")
}

func handlerLayout(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./build/layout.css")
}

func handlerFontAwesomeMinCSS(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/css/font-awesome.min.css")
}

func handlerFontsFaOTF(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/fonts/FontAwesome.otf")
}

func handlerFontsFaEOT(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/fonts/fontawesome-webfont.eot")
}

func handlerFontsFaSVG(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/fonts/fontawesome-webfont.svg")
}

func handlerFontsFaTTF(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/fonts/fontawesome-webfont.ttf")
}

func handlerFontsFaWOFF(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/fonts/fontawesome-webfont.woff")
}

func handlerFontsFaWOFF2(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/fonts/fontawesome-webfont.woff2")
}

func handlerSiriDBLargePNG(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/img/siridb-large.png")
}

func handlerSiriDBSmallPNG(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/img/siridb-small.png")
}

func handlerLoaderGIF(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/img/loader.gif")
}

func handlerLeriMinJS(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/js/libs/jsleri-1.1.2.js")
}

func handlerGrammarJS(w http.ResponseWriter, r *http.Request) {
	handleFileRequest(w, "./static/js/grammar.js")
}

func handleFileRequest(w http.ResponseWriter, fn string) {
	b, err := ioutil.ReadFile(fn)
	if err == nil {
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
