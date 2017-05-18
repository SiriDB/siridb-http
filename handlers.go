package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/googollee/go-socket.io"
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

type tAuthFetch struct {
	User         interface{} `json:"user"`
	AuthRequired bool        `json:"authRequired"`
}

func onAuthFetch(so socketio.Socket) (status int, resp string) {
	var authFetch tAuthFetch
	if base.reqAuth {

		user, ok := base.ssessions[so.Id()]

		if !ok {
			authFetch.User = nil
		} else {
			conn := getConnByUser(user)
			if conn == nil {
				authFetch.User = nil
			} else {
				authFetch.User = user
			}
		}

		authFetch.AuthRequired = true
	} else {
		authFetch.User = base.connections[0].user
		authFetch.AuthRequired = false
	}

	b, err := json.Marshal(authFetch)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}
	return http.StatusOK, string(b)
}

func handlerAuthFetch(w http.ResponseWriter, r *http.Request) {

	var authFetch tAuthFetch
	if base.reqAuth {
		sess, err := globalSessions.SessionStart(w, r)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user, ok := sess.Get("user").(string)

		if !ok {
			authFetch.User = nil
		} else {
			conn := getConnByUser(user)
			if conn == nil {
				authFetch.User = nil
			} else {
				authFetch.User = user
			}
		}

		authFetch.AuthRequired = true
	} else {
		authFetch.User = base.connections[0].user
		authFetch.AuthRequired = false
	}

	if b, err := json.Marshal(authFetch); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerNotFound(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "404 not found", http.StatusNotFound)
}

func getConnByUser(user string) *Conn {
	for _, conn := range base.connections {
		if conn.user == user {
			return &conn
		}
	}
	return nil
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

	if conn := getConnByUser(authLoginReq.Username); conn != nil {
		if authLoginReq.Password != conn.password {
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
	sess, err := globalSessions.SessionStart(w, r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user, ok := sess.Get("user").(string)

	if !ok {
		http.Error(w, "not authenticated", http.StatusUnauthorized)
	}

	conn := getConnByUser(user)
	if conn == nil {
		http.Error(
			w,
			fmt.Sprintf("no connection for user '%s' found, please try to login again", user),
			http.StatusUnauthorized)
		return
	}

	type Query struct {
		Query   string      `json:"query"`
		Timeout interface{} `json:"timeout"`
	}

	var query Query

	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&query)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	timeout, ok := query.Timeout.(uint16)
	if !ok {
		timeout = 30
	}

	res, err := conn.client.Query(query.Query, timeout)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if b, err := json.Marshal(res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}
