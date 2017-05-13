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
	}

	db := Db{Dbname: base.dbname, TimePrecision: base.timePrecision, Version: base.version}

	if b, err := json.Marshal(db); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerNotFound(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "404 not found", http.StatusNotFound)
}
