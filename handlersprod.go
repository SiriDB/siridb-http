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
	w.Write(FileBundleMinJS)
}

func handlerFaviconIco(w http.ResponseWriter, r *http.Request) {
	w.Write(FileFaviconICO)
}

func handlerBootstrapCSS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/css")
	w.Write(FileBootstrapMinCSS)
}

func handlerLayout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/css")
	w.Write(FileLayoutMinCSS)
}

func handlerFontAwesomeMinCSS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/css")
	w.Write(FileFontAwesomeMinCSS)
}

func handlerFontsFaOTF(w http.ResponseWriter, r *http.Request) {
	w.Write(FileFontAwesomeOTF)
}

func handlerFontsFaEOT(w http.ResponseWriter, r *http.Request) {
	w.Write(FileFontawesomeWebfontEOT)
}

func handlerFontsFaSVG(w http.ResponseWriter, r *http.Request) {
	w.Write(FileFontawesomeWebfontSVG)
}

func handlerFontsFaTTF(w http.ResponseWriter, r *http.Request) {
	w.Write(FileFontawesomeWebfontTTF)
}

func handlerFontsFaWOFF(w http.ResponseWriter, r *http.Request) {
	w.Write(FileFontawesomeWebfontWOFF)
}

func handlerFontsFaWOFF2(w http.ResponseWriter, r *http.Request) {
	w.Write(FileFontawesomeWebfontWOFF2)
}

func handlerSiriDBLargePNG(w http.ResponseWriter, r *http.Request) {
	w.Write(FileSiriDBLargePNG)
}

func handlerSiriDBSmallPNG(w http.ResponseWriter, r *http.Request) {
	w.Write(FileSiriDBSmallPNG)
}

func handlerLoaderGIF(w http.ResponseWriter, r *http.Request) {
	w.Write(FileLoaderGIF)
}

func handlerLeriMinJS(w http.ResponseWriter, r *http.Request) {
	w.Write(FileLeriMinJS)
}

func handlerGrammarJS(w http.ResponseWriter, r *http.Request) {
	w.Write(FileGrammarJS)
}
