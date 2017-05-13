// +build !debug

package main

import "net/http"

func handlerMain(w http.ResponseWriter, r *http.Request) {
	w.Write(FileIndexHTML)
}
