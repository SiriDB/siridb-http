package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/googollee/go-socket.io"
)

type tDb struct {
	Dbname        string `json:"dbname"`
	TimePrecision string `json:"timePrecision"`
	Version       string `json:"version"`
	HTTPServer    string `json:"httpServer"`
}

type tAuthFetch struct {
	User         interface{} `json:"user" qp:"user"`
	AuthRequired bool        `json:"authRequired" qp:"authRequired"`
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

func onDbInfo(so *socketio.Socket) (int, string) {
	db := tDb{
		Dbname:        base.dbname,
		TimePrecision: base.timePrecision,
		Version:       base.version,
		HTTPServer:    AppVersion}

	b, err := json.Marshal(db)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}
	return http.StatusOK, string(b)
}

func handlerDbInfo(w http.ResponseWriter, r *http.Request) {
	db := tDb{
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

func onAuthFetch(so *socketio.Socket) (int, string) {
	authFetch := tAuthFetch{User: nil, AuthRequired: base.reqAuth}

	if user, ok := base.ssessions[(*so).Id()]; ok && getConnByUser(user) != nil {
		authFetch.User = user
	} else if !base.reqAuth {
		authFetch.User = base.connections[0].user
	}

	b, err := json.Marshal(authFetch)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}
	return http.StatusOK, string(b)
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

type tAuthLoginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type tAuthLoginRes struct {
	User string `json:"user"`
}
type tAuthLogoff struct {
	User interface{} `json:"user"`
}

func onAuthLogin(so *socketio.Socket, req string) (int, string) {
	fmt.Println("Auth login....")
	var authLoginReq tAuthLoginReq

	err := json.Unmarshal([]byte(req), &authLoginReq)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}

	if conn := getConnByUser(authLoginReq.Username); conn != nil {
		if authLoginReq.Password != conn.password {
			return http.StatusUnprocessableEntity, "Username or password incorrect"
		}
	} else if base.multiUser {
		fmt.Println(authLoginReq)
	} else {
		return http.StatusUnprocessableEntity, "Multiple user login is not allowed"

	}

	base.ssessions[(*so).Id()] = authLoginReq.Username
	authLoginRes := tAuthLoginRes{User: authLoginReq.Username}

	b, err := json.Marshal(authLoginRes)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}
	return http.StatusOK, string(b)
}

func handlerAuthLogin(w http.ResponseWriter, r *http.Request) {

	var authLoginReq tAuthLoginReq

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
	authLoginRes := tAuthLoginRes{User: authLoginReq.Username}
	if b, err := json.Marshal(authLoginRes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(b)
	}
}

func handlerAuthLogoff(w http.ResponseWriter, r *http.Request) {
	authLogoff := tAuthLogoff{User: nil}

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

func getConnBySIO(so *socketio.Socket) (conn *Conn, err error) {
	if user, ok := base.ssessions[(*so).Id()]; ok {
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

func onQuery(so *socketio.Socket, req string) (int, string) {
	conn, err := getConnBySIO(so)
	if err != nil {
		return http.StatusUnauthorized, err.Error()
	}

	type Query struct {
		Query   string      `json:"query"`
		Timeout interface{} `json:"timeout"`
	}

	var query Query

	fmt.Println(req)

	if err = json.Unmarshal([]byte(req), &query); err != nil {
		return http.StatusInternalServerError, err.Error()
	}

	timeout, ok := query.Timeout.(uint16)
	if !ok {
		timeout = 30
	}

	res, err := conn.client.Query(query.Query, timeout)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}

	b, err := json.Marshal(res)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}
	return http.StatusOK, string(b)
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

func onInsert(so *socketio.Socket, req string) (int, string) {
	conn, err := getConnBySIO(so)
	if err != nil {
		return http.StatusUnauthorized, err.Error()
	}

	var insert interface{}

	fmt.Println(req)

	if err = json.Unmarshal([]byte(req), &insert); err != nil {
		return http.StatusInternalServerError, err.Error()
	}

	res, err := conn.client.Insert(insert, base.insertTimeout)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}

	b, err := json.Marshal(res)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}
	return http.StatusOK, string(b)
}

func handlerInsert(w http.ResponseWriter, r *http.Request) {
	if conn := getConnByHTTP(w, r); conn != nil {
		var insert interface{}

		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&insert)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		res, err := conn.client.Insert(insert, base.insertTimeout)
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
