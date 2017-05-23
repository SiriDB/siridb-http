package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/googollee/go-socket.io"
	siridb "github.com/transceptor-technology/go-siridb-connector"
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

func checkBasicAuth(r *http.Request) (conn *Conn) {
	if !base.enableBasicAuth {
		return nil
	}
	username, password, ok := r.BasicAuth()
	if !ok {
		return nil
	}
	conn = getConnByUser(username)
	if conn != nil {
		if password == conn.password {
			return conn
		}
		return nil
	}
	if base.multiUser {
		conn, _ = addConnection(username, password)
	}
	return conn
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

func getConnByHTTP(w http.ResponseWriter, r *http.Request) *Conn {
	var conn *Conn

	if conn = checkBasicAuth(r); conn != nil {
		return conn
	}
	sess, err := base.gsessions.SessionStart(w, r)

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

func sendJSON(w http.ResponseWriter, data interface{}) {
	if b, err := json.Marshal(data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Write(b)
	}
}

func retJSON(data interface{}) (int, string) {
	b, err := json.Marshal(data)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}
	return http.StatusOK, string(b)
}

func getConnByUser(user string) *Conn {
	for _, conn := range base.connections {
		if conn.user == user {
			return &conn
		}
	}
	return nil
}

func addConnection(username, password string) (*Conn, error) {
	var conn Conn
	conn.user = username
	conn.password = password
	conn.client = siridb.NewClient(
		conn.user,                        // user
		conn.password,                    // password
		base.dbname,                      // database
		serversToInterface(base.servers), // siridb server(s)
		base.logCh,                       // optional log channel
	)
	conn.client.Connect()
	if conn.client.IsConnected() {
		base.connections = append(base.connections, conn)
	} else {
		conn.client.Close()
		return nil, fmt.Errorf("Cannot login using the username and password")
	}
	return &conn, nil
}

func handlerNotFound(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "404 not found", http.StatusNotFound)
}

func onDbInfo(so *socketio.Socket) (int, string) {
	db := tDb{
		Dbname:        base.dbname,
		TimePrecision: base.timePrecision,
		Version:       base.version,
		HTTPServer:    AppVersion}
	return retJSON(db)
}

func handlerDbInfo(w http.ResponseWriter, r *http.Request) {
	db := tDb{
		Dbname:        base.dbname,
		TimePrecision: base.timePrecision,
		Version:       base.version,
		HTTPServer:    AppVersion}
	sendJSON(w, db)
}

func onAuthFetch(so *socketio.Socket) (int, string) {
	authFetch := tAuthFetch{User: nil, AuthRequired: base.reqAuth}

	if user, ok := base.ssessions[(*so).Id()]; ok && getConnByUser(user) != nil {
		authFetch.User = user
	} else if !base.reqAuth {
		authFetch.User = base.connections[0].user
	}
	return retJSON(authFetch)
}

func handlerAuthFetch(w http.ResponseWriter, r *http.Request) {

	authFetch := tAuthFetch{User: nil, AuthRequired: base.reqAuth}
	sess, err := base.gsessions.SessionStart(w, r)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if user, ok := sess.Get("user").(string); ok && getConnByUser(user) != nil {
		authFetch.User = user
	} else if !base.reqAuth {
		authFetch.User = base.connections[0].user
	}
	sendJSON(w, authFetch)
}

func onAuthLogin(so *socketio.Socket, req string) (int, string) {
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
		if _, err := addConnection(authLoginReq.Username, authLoginReq.Password); err != nil {
			return http.StatusUnprocessableEntity, err.Error()
		}
	} else {
		return http.StatusUnprocessableEntity, "Multiple user login is not allowed"
	}

	base.ssessions[(*so).Id()] = authLoginReq.Username
	authLoginRes := tAuthLoginRes{User: authLoginReq.Username}

	return retJSON(authLoginRes)
}

func handlerAuthLogin(w http.ResponseWriter, r *http.Request) {

	var authLoginReq tAuthLoginReq

	sess, err := base.gsessions.SessionStart(w, r)
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
		if _, err := addConnection(authLoginReq.Username, authLoginReq.Password); err != nil {
			http.Error(w, err.Error(), http.StatusUnprocessableEntity)
			return
		}
	} else {
		http.Error(w, "Multiple user login is not allowed", http.StatusUnprocessableEntity)
		return
	}

	sess.Set("user", authLoginReq.Username)
	authLoginRes := tAuthLoginRes{User: authLoginReq.Username}
	sendJSON(w, authLoginRes)
}

func onAuthLogout(so *socketio.Socket) (int, string) {
	authLogoff := tAuthLogoff{User: nil}
	delete(base.ssessions, (*so).Id())
	return retJSON(authLogoff)
}

func handlerAuthLogout(w http.ResponseWriter, r *http.Request) {
	authLogoff := tAuthLogoff{User: nil}

	sess, err := base.gsessions.SessionStart(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = sess.Flush(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	sendJSON(w, authLogoff)
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

	return retJSON(res)
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

		sendJSON(w, res)
	}
}

func onInsert(so *socketio.Socket, req string) (int, string) {
	conn, err := getConnBySIO(so)
	if err != nil {
		return http.StatusUnauthorized, err.Error()
	}

	var insert interface{}

	decoder := json.NewDecoder(strings.NewReader(req))
	decoder.UseNumber()

	if err = decoder.Decode(&insert); err != nil {
		return http.StatusInternalServerError, err.Error()
	}

	res, err := conn.client.Insert(insert, base.insertTimeout)
	if err != nil {
		return http.StatusInternalServerError, err.Error()
	}

	return retJSON(res)
}

func handlerInsert(w http.ResponseWriter, r *http.Request) {
	if conn := getConnByHTTP(w, r); conn != nil {
		var insert interface{}

		decoder := json.NewDecoder(r.Body)
		decoder.UseNumber()

		if err := decoder.Decode(&insert); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		res, err := conn.client.Insert(insert, base.insertTimeout)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		sendJSON(w, res)
	}
}
