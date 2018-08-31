// +build !debug

package main

import "net/http"

func handlerMain(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		handlerNotFound(w, r)
	} else if base.connections[0].client.IsConnected() {
		w.Header().Set("Content-Type", "text/html")
		w.Write(FileIndexHTML)
	} else {
		w.Header().Set("Content-Type", "text/html")
		w.Write(FileWaitingHTML)
	}
}

func handlerJsBundle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/javascript")
	w.Write(FileBundleMinJS)
}

func handlerFaviconIco(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "image/x-icon")
	w.Write(FileFaviconICO)
}

func handlerSiriDBLargePNG(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "image/png")
	w.Write(FileSiriDBLargePNG)
}

func handlerSiriDBSmallPNG(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "image/png")
	w.Write(FileSiriDBSmallPNG)
}

func handlerLoaderGIF(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "image/gif")
	w.Write(FileLoaderGIF)
}
