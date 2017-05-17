package main

import (
	"encoding/json"
	"fmt"
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
	type AuthFetch struct {
		User         interface{} `json:"user"`
		AuthRequired bool        `json:"authRequired"`
	}
	authFetch := AuthFetch{User: nil, AuthRequired: true}

	if b, err := json.Marshal(authFetch); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerNotFound(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "404 not found", http.StatusNotFound)
}

func handlerAuthLogin(w http.ResponseWriter, r *http.Request) {
	type AuthLoginReq struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	type AuthLoginRes struct {
		User string `json:"user"`
	}
	var authLoginReq AuthLoginReq

	sess, err := globalSessions.SessionStart(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&authLoginReq)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if authLoginReq.Username == base.user {
		if authLoginReq.Password != base.password {
			http.Error(w, "Username or password incorrect", http.StatusUnprocessableEntity)
			return
		}

	} else if base.multiUser {
		fmt.Println(authLoginReq)
	} else {
		http.Error(w, "Multiple user login is not allowed", http.StatusUnprocessableEntity)
		return
	}

	sess.Set("user", authLoginReq.Username)
	authLoginRes := AuthLoginRes{User: authLoginReq.Username}
	if b, err := json.Marshal(authLoginRes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerAuthLogoff(w http.ResponseWriter, r *http.Request) {

	contentType := r.Header.Get("Content-type")
	fmt.Println(contentType)

	type AuthLogoff struct {
		User interface{} `json:"user"`
	}

	authLogoff := AuthLogoff{User: nil}

	sess, err := globalSessions.SessionStart(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = sess.Flush()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if b, err := json.Marshal(authLogoff); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerQuery(w http.ResponseWriter, r *http.Request) {

}
