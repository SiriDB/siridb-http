package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/googollee/go-socket.io"
	"github.com/graarh/golang-socketio"
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
	User         interface{} `json:"user" qp:"user"`
	AuthRequired bool        `json:"authRequired" qp:"authRequired"`
}

func onAuthFetch(c *gosocketio.Channel) (status int, resp string) {
	return 0, "bla"
	// authFetch := tAuthFetch{User: nil, AuthRequired: base.reqAuth}

	// if user, ok := base.ssessions[so.Id()]; ok && getConnByUser(user) != nil {
	// 	authFetch.User = user
	// } else if !base.reqAuth {
	// 	authFetch.User = base.connections[0].user
	// }

	// return 0, "bla"

	// b, err := json.Marshal(authFetch)
	// if err != nil {
	// 	return http.StatusInternalServerError, err.Error()
	// }
	// return http.StatusOK, string(b)
}

func handlerAuthFetch(w http.ResponseWriter, r *http.Request) {

	authFetch := tAuthFetch{User: nil, AuthRequired: base.reqAuth}
	sess, err := globalSessions.SessionStart(w, r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if user, ok := sess.Get("user").(string); ok && getConnByUser(user) != nil {
		authFetch.User = user
	} else if !base.reqAuth {
		authFetch.User = base.connections[0].user
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

func getConnBySIO(so socketio.Socket) (conn *Conn, err error) {
	if user, ok := base.ssessions[so.Id()]; ok {
		conn = getConnByUser(user)
		if conn == nil {
			err = fmt.Errorf("no connection for user '%s' found, please try to login again", user)
		}
	} else if base.reqAuth {
		err = fmt.Errorf("not authenticated")
	} else {
		conn = &base.connections[0]
	}
	return conn, err
}

func onQuery(so socketio.Socket) (status int, resp string) {
	fmt.Printf("Query...\n")
	_, err := getConnBySIO(so)
	if err != nil {
		return http.StatusUnauthorized, err.Error()
	}

	type Query struct {
		Query   string      `json:"query"`
		Timeout interface{} `json:"timeout"`
	}

	// var query Query

	// fmt.Println(req)
	return http.StatusOK, "ok"

	// decoder := json.NewDecoder(r.Body)
	// err = decoder.Decode(&query)

	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	// timeout, ok := query.Timeout.(uint16)
	// if !ok {
	// 	timeout = 30
	// }

	// res, err := conn.client.Query(query.Query, timeout)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	// if b, err := json.Marshal(res); err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// } else {
	// 	w.Write(b)
	// }
}

func getConnByHTTP(w http.ResponseWriter, r *http.Request) *Conn {
	var conn *Conn
	sess, err := globalSessions.SessionStart(w, r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		user, ok := sess.Get("user").(string)
		if ok {
			conn = getConnByUser(user)
			if conn == nil {
				http.Error(
					w,
					fmt.Sprintf("no connection for user '%s' found, please try to login again", user),
					http.StatusUnauthorized)
			}
		} else if base.reqAuth {
			http.Error(w, "not authenticated", http.StatusUnauthorized)
		} else {
			conn = &base.connections[0]
		}
	}
	return conn
}

func handlerQuery(w http.ResponseWriter, r *http.Request) {
	if conn := getConnByHTTP(w, r); conn != nil {
		type Query struct {
			Query   string      `json:"query"`
			Timeout interface{} `json:"timeout"`
		}

		var query Query

		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&query)

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
}
