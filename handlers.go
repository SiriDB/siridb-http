package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"reflect"
	"strings"

	"github.com/googollee/go-socket.io"
	qpack "github.com/transceptor-technology/go-qpack"
	siridb "github.com/transceptor-technology/go-siridb-connector"
	msgpack "gopkg.in/vmihailenco/msgpack.v2"
)

type tDb struct {
	Dbname        string `json:"dbname" qp:"dbname" msgpack:"dbname"`
	TimePrecision string `json:"timePrecision" qp:"timePrecision" msgpack:"timePrecision"`
	Version       string `json:"version" qp:"version" msgpack:"version"`
	HTTPServer    string `json:"httpServer" qp:"httpServer" msgpack:"httpServer"`
}

type tAuthFetch struct {
	User         interface{} `json:"user" qp:"user" msgpack:"user"`
	AuthRequired bool        `json:"authRequired" qp:"authRequired" msgpack:"authRequired"`
}

type tAuthLoginReq struct {
	Username string `json:"username" qp:"username" msgpack:"username"`
	Password string `json:"password" qp:"password" msgpack:"password"`
}

type tAuthLoginRes struct {
	User string `json:"user" qp:"user" msgpack:"user"`
}

type tAuthLogoff struct {
	User interface{} `json:"user" qp:"user" msgpack:"user"`
}

type tQuery struct {
	Query   string      `json:"query" qp:"query" msgpack:"query"`
	Timeout interface{} `json:"timeout" qp:"timeout" msgpack:"timeout"`
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
		sendError(w, err.Error(), http.StatusInternalServerError)
	} else {
		user, ok := sess.Get("user").(string)
		if ok {
			conn = getConnByUser(user)
			if conn == nil {
				sendError(
					w,
					fmt.Sprintf("no connection for user '%s' found, please try to login again", user),
					http.StatusUnauthorized)
			}
		} else if base.reqAuth {
			sendError(w, "not authenticated", http.StatusUnauthorized)
		} else {
			conn = &base.connections[0]
		}
	}
	return conn
}

func sendError(w http.ResponseWriter, err string, code int) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	http.Error(w, err, code)
}

func sendJSON(w http.ResponseWriter, data interface{}) {
	if b, err := json.Marshal(data); err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Write(b)
	}
}

func sendQPack(w http.ResponseWriter, data interface{}) {
	if b, err := qpack.Pack(data); err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/x-qpack; charset=UTF-8")
		w.Write(b)
	}
}

func sendMsgPack(w http.ResponseWriter, data interface{}) {
	if b, err := msgpack.Marshal(data); err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/x-msgpack; charset=UTF-8")
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
	sendError(w, "404 not found", http.StatusNotFound)
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
	sendData(w, r, db)
}

func sendData(w http.ResponseWriter, r *http.Request, data interface{}) {
	contentType := r.Header.Get("Content-type")

	switch strings.ToLower(contentType) {
	case "application/json":
		sendJSON(w, data)
	case "application/x-qpack":
		sendQPack(w, data)
	case "application/x-msgpack":
		sendMsgPack(w, data)
	default:
		fmt.Println(data)
		sendError(w, fmt.Sprintf("unsupported content-type: %s", contentType), http.StatusUnsupportedMediaType)
	}
}

func readBody(w http.ResponseWriter, r *http.Request, v interface{}) error {
	contentType := r.Header.Get("Content-type")

	switch strings.ToLower(contentType) {
	case "application/csv":
		return readCSV(w, r, &v)

	case "application/json":
		return readJSON(w, r, &v)
	case "application/x-qpack":
		return readQPack(w, r, &v)
	case "application/x-msgpack":
		return readMsgPack(w, r, &v)
	default:
		err := fmt.Errorf("unsupported content-type: %s", contentType)
		sendError(w, err.Error(), http.StatusUnsupportedMediaType)
		return err
	}
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
		sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if user, ok := sess.Get("user").(string); ok && getConnByUser(user) != nil {
		authFetch.User = user
	} else if !base.reqAuth {
		authFetch.User = base.connections[0].user
	}
	sendData(w, r, authFetch)
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
		sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := readBody(w, r, &authLoginReq); err != nil {
		return // error is send by the readBody function
	}

	if conn := getConnByUser(authLoginReq.Username); conn != nil {
		if authLoginReq.Password != conn.password {
			sendError(w, "Username or password incorrect", http.StatusUnprocessableEntity)
			return
		}
	} else if base.multiUser {
		if _, err := addConnection(authLoginReq.Username, authLoginReq.Password); err != nil {
			sendError(w, err.Error(), http.StatusUnprocessableEntity)
			return
		}
	} else {
		sendError(w, "Multiple user login is not allowed", http.StatusUnprocessableEntity)
		return
	}

	sess.Set("user", authLoginReq.Username)
	authLoginRes := tAuthLoginRes{User: authLoginReq.Username}
	sendData(w, r, authLoginRes)
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
		sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = sess.Flush(); err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	sendData(w, r, authLogoff)
}

func onQuery(so *socketio.Socket, req string) (int, string) {
	conn, err := getConnBySIO(so)
	if err != nil {
		return http.StatusUnauthorized, err.Error()
	}

	var query tQuery

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
		var query tQuery

		if err := readBody(w, r, &query); err != nil {
			return // error is send by the readBody function
		}

		timeout, ok := query.Timeout.(uint16)
		if !ok {
			timeout = 30
		}

		res, err := conn.client.Query(query.Query, timeout)
		if err != nil {
			sendError(w, err.Error(), http.StatusInternalServerError)
			return
		}

		sendData(w, r, res)
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

func readJSON(w http.ResponseWriter, r *http.Request, v *interface{}) error {
	decoder := json.NewDecoder(r.Body)
	decoder.UseNumber()
	if err := decoder.Decode(v); err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	return nil
}

func readMsgPack(w http.ResponseWriter, r *http.Request, v *interface{}) error {
	decoder := msgpack.NewDecoder(r.Body)
	if err := decoder.Decode(v); err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	return nil
}

func resToPlan(w http.ResponseWriter, res interface{}, v *interface{}) error {
	iface, ok := (*v).(*interface{})
	if ok {
		*iface = res
		return nil
	}

	m, ok := res.(map[string]interface{})
	if !ok {
		err := fmt.Errorf("expecting a map for a non interface{} value")
		sendError(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	e := reflect.ValueOf(*v).Elem()
	t := e.Type()
	n := t.NumField()

	for i := 0; i < n; i++ {
		field := t.Field(i)
		fn := field.Tag.Get("qp")
		if len(fn) == 0 {
			fn = field.Name
		}
		val, ok := m[fn]
		if ok {
			e.Field(i).Set(reflect.ValueOf(val))
		}
	}
	return nil
}

func readQPack(w http.ResponseWriter, r *http.Request, v *interface{}) error {
	b, err := ioutil.ReadAll(r.Body)

	if err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	res, err := qpack.Unpack(b, qpack.QpFlagStringKeysOnly)
	if err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	return resToPlan(w, res, v)
}

func readCSV(w http.ResponseWriter, r *http.Request, v *interface{}) error {
	res, err := parseCsv(r.Body)
	if err != nil {
		sendError(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	return resToPlan(w, res, v)
}

func handlerInsert(w http.ResponseWriter, r *http.Request) {
	if conn := getConnByHTTP(w, r); conn != nil {
		var insert interface{}
		if err := readBody(w, r, &insert); err != nil {
			return // error is send by the readBody function
		}

		res, err := conn.client.Insert(insert, base.insertTimeout)
		if err != nil {
			sendError(w, err.Error(), http.StatusInternalServerError)
			return
		}

		sendData(w, r, res)
	}
}
