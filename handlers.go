package main

import (
	"encoding/json"
	"net/http"
)

func handlerDbInfo(w http.ResponseWriter, r *http.Request) {
	type Db struct {
		Dbname        string `json:"dbname"`
		TimePrecision string `json:"timePrecision"`
		Version       string `json:"version"`
		HTTPServer    string `json:"httpServer"`
	}

	db := Db{
		Dbname:        base.dbname,
		TimePrecision: base.timePrecision,
		Version:       base.version,
		HTTPServer:    AppVersion}

	if b, err := json.Marshal(db); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerAuthFetch(w http.ResponseWriter, r *http.Request) {
	type Auth struct {
		User         string `json:"user"`
		AuthRequired bool   `json:"authRequired"`
	}
	auth := Auth{User: base.user, AuthRequired: true}

	if b, err := json.Marshal(auth); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerNotFound(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "404 not found", http.StatusNotFound)
}
