# SiriDB HTTP
![alt SiriDB HTTP](/siridb-http.png?raw=true)

SiriDB HTTP provides a HTTP API and optional web interface for [SiriDB](https://github.com/transceptor-technology/siridb-server).

> Note: Since version 2.0.0 SiriDB HTTP is written in Go. For the 1.x version in Python you should go to
> this [release tag](https://github.com/transceptor-technology/siridb-http/tree/1.0.7).

---------------------------------------
  * [Features](#features)
  * [Installation](#installation)
    * [Pre-compiled](#pre-compiled)
    * [Compile from source](#compile-from-source)
  * [Configuration](#configuration)
    * [Autorun on startup](#autorun-on-startup)
    * [Multi server support](#multi-server-support)
  * [HTTP API](#http-api)
    * [Content Types](#content-types)
    * [Database info](#database-info)
    * [Authentication](#authentication)
      * [Session authentication](#session-authentication)
        * [Fetch](#fetch)
        * [Login](#login)
        * [Logout](#logout)
      * [Basic authentication](#basic-authentication)
    * [Query](#query)
    * [Insert](#insert)
      * [JSON, MsgPack, QPack](#insert-json)
      * [CSV](#insert-csv)
        * [List format](#list-format)
        * [Table format](#table-format)
  * [Socket.io](#socketio)
  * [Web Interface](#web-interface)
  * [SSL (HTTPS)](#ssl-https)
---------------------------------------

## Features
  - Optional Web interface for sending queries and inserting data
  - SSL (HTTPS) support
  - Optional Basic Authentication
  - Support for JSON, MsgPack, QPack and CSV
  - IPv6 support
  - Socket.io support


## Installation
SiriDB HTTP 2.x can be compiled from source or, for most systems, you can simply download a pre-compiled binary.

### Pre-compiled
Go to https://github.com/transceptor-technology/siridb-http/releases/latest and download the binary for your system.
In this documentation we refer to the binary as `siridb-http`. On Linux/OSX it might be required to set the execution flag:
```
$ chmod +x siridb-http_X.Y.Z_OS_ARCH.bin
```

You might want to copy the binary to /usr/local/bin and create a symlink like this:
```
$ sudo cp siridb-http_X.Y.Z_OS_ARCH.bin /usr/local/bin/
$ sudo ln -s /usr/local/bin/siridb-http_X.Y.Z_OS_ARCH.bin /usr/local/bin/siridb-http
```
> Note: replace `X.Y.Z_OS_ARCH` with your binary, for example `2.0.0_linux_amd64`

### Compile from source
> Before compiling from source make sure **go**, **npm** and **git** are installed and your [$GOPATH](https://github.com/golang/go/wiki/GOPATH) is set.

Clone the project using git. (we assume git is installed)
```
git clone https://github.com/transceptor-technology/siridb-http
```

Make sure less is installed:
```
$ sudo npm install -g less less-plugin-clean-css
```

The gobuild.py script can be used to build the binary:
```
$ ./gobuild.py -i -l -w -b -p
```

Or, if you want the development version which uses original files from /build and /static instead of build-in files:
```
$ ./gobuild.py -i -l -w -b -d
```

## Configuration
For running SiriDB HTTP a configuration file is required and should be provided using the `-c` or `--config` argument. The easiest way to create a configuration file is to save the output from
siridb-http to a file:

> Note: you might want to switch to root and later create a service to automically start SiriDB HTTP at startup.

Switch to root or skip this step if you want to save the configuration file with your current user.
```
$ sodu su -
```

Save a template configuration file to for example ~/.siridb-http.conf.
```
$ siridb-http > ~/.siridb-http.conf
```

Now edit the file with you favorite editor and at least set the `user`, `password` and `dbname`.
When the configuration is saved you can start the server using:
```
$ siridb-http -c ~/.siridb-http.conf
```

### Autorun on startup
Depending on your OS and subsystem you can create a service to start SiriDB HTTP.
This is an example of how to do this using systemd which is currently the default for Ubuntu:

First create the service file: (you might need to change the ExecStart line)
```
$ sudo cat > /lib/systemd/system/siridb-http.service <<EOL
[Unit]
Description=SiriDB HTTP Service
After=network.target

[Service]
ExecStart=/usr/local/bin/siridb-http --config ~/.siridb-http.conf
StandardOutput=journal
TimeoutStartSec=3
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
EOL
```

Now reload the daemon and start the service
```
sudo systemctl daemon-reload
sudo systemctl start siridb-http.service
```


### Multi server support
SiriDB can scale across multiple pools and can be made high-available by adding two servers to each pool. For example you could have four siridb servers sdb01, sdb02, sdb03 and sdb04 all listening to port 9000. In this example we assume sdb01 and sdb02 are members of `pool 0` and sdb03 and sdb04 are members of `pool 1`.

We should now configure SiriDB to connect to both servers in pool 0 and/or pool 1. This ensures that queries and inserts always work, even when a server in the SiriDB cluster is not available for whatever reason. The only requirement is that each pool has at least one server online.

To configure SiriDB HTTP to connect to multiple servers a comma must be used as separator like this:
```
[Database]
...
servers = sdb01,sdb02,sdb03,sdb04
```

## API
SiriDB HTTP provides both a REST API and Socket.io support which can be used to insert and query a SiriDB cluster.

### Content Types
The following URIs have support for JSON, MsgPack, QPack and CSV:
- /db-info
- /auth/fetch
- /auth/login
- /auth/logout
- /query
- /insert

In most examples below we use JSON but this format is fully compatible with MsgPack and QPack so it
should be easy to translate. CSV on the other hand is different and unless explained, each request and
response can be transfomed to a key,value per line. See the example below:
```json
{
    "username": "my_username",
    "password": "my_password"
}
```

The above translates to the following CSV:
```
username,my_username
password,my_password
```

> Note: when a string in CSV contains a comma (,) then the string must be wrapped between double quotes.
> If double quotes are also required in a string, the double quote should be escaped with a second double quote.

### Database info
With the `/db-info` URI, database and version information can be asked.
```
type:      GET or POST
uri:       /db-info
header:    Content-Type:  'application/json'
```

Response:
```json
{
    "dbname": "my_database-name",
    "timePrecision": "database time precision: s, ms, us or ns",
    "version": "SiriDB Server version, for example: 2.0.18",
    "httpServer": "SiriDB HTTP version, for example: 2.0.0"
}
```

> Note that `version` does not guarantee that each SiriDB server in a cluster is running the same version.

### Authentication
Authentication is required when `require_authentication` is set to `True` in the configuration file. When authentication is not required, the `/insert` and `/query` URIs can be used directly without any authentication as long as the user configured in the configuration file has privileges to perform the request.

#### Session authentication
SiriDB HTTP has session support and exposes the following URIs for handling session authentication:
- /auth/fetch
- /auth/login
- /auth/logout

> Note: in the examples below we use 'application/json' as Content-Type but the following alternatives
> are also allowed: 'application/x-msgpack', 'application/x-qpack' and 'application/csv'.

##### Fetch
Fetch can be used to retrieve the current session user.
```
type:      GET or POST
uri:       /auth/fetch
header:    Content-Type:  'application/json'
```
The response contains the current user and a boolean value to indicate if authentication is required. In case no user is logged on and authentication is required, the value for `user` will be `null`.

Example response:
```json
{
    "user": "logged_on_username_or_null",
    "authRequired": true
}
```

##### Login
Login can be used to authenticate and create a SiriDB database user. If the option `enable_multi_user` in the configuration file is set to `True`, any database user can be used. In case multi user support is turned off, the only allowed user is the one configured in the configuration file.

```
type:      POST
uri:       /auth/login
header:    Content-Type:  'application/json'
body:      {"username": <my-username>, "password": <my-secret-password>}
```

Success response:
```json
{
    "user": "logged_on_username"
}
```

In case authentication has failed, error code 422 will be returned and the body will contain an appropriate error message.

##### Logout
When calling this uri the current session will be cleared.
```
type:      GET or POST
uri:       /auth/logout
header:    Content-Type:  'application/json'
```
Response:
```json
{
    "user": null
}
```

#### Basic authentication
As an alternative to session authentication it is possible to use basic authentication. To allow basic authentication the option `enable_basic_auth` must be set to `True` in the configuration file.

Example Authorization header for username *iris* with password *siri*:
```
Authorization: Basic aXJpczpzaXJp
```

### Query
The `/query` POST handler can be used for querying SiriDB. SiriDB HTTP supports multiple formats that can be used by setting the `Content-Type` in the header.
```
type:      POST
uri:       /query
header:    Content-Type:  'application/json'
body:      {"query": <query string>, "timeout": <optional timout in seconds>}
```

Example body:
```json
{
    "query": "select mean(1h) => difference() from 'my-series'"
}
```

### Insert
The `/insert` POST handler can be used for inserting data into SiriDB. The same content types as for queries are supported. Both MsgPack and QPack are similar to JSON except that the data is packed to a byte string. Therefore we only explain JSON and CSV data here. *(Note: in the examples below we use a second time-precision)*

#### Insert JSON
The preferred json layout is as following: (this is the layout which is returned by SiriDB on a select query)
```json
{
    "my-series-01": [[1493126582, 4.2], ...],
    ...
}
```

Optionally the following format can be used:
```json
[
    {
        "name": "my-series-01",
        "points": [[1493126582, 4.2], ...]
    },
    ...
]
```

#### Insert CSV
CSV data is allowed in two formats which we call the list and table format.

##### List format
When using the list format, each row in the csv should contain a series name, timestamp and value.

Example list:
```csv
Series 001,1440138931,100
Series 003,1440138931,8.0
Series 001,1440140932,40
Series 002,1440140932,9.3
```
##### Table format
A table format is more compact, especially if multiple series share points with equal timestamps. The csv should start with an empty field that is indicated with the first comma.

Example table:
```csv
,Series 001,Series 002,Series 003
1440138931,100,,8.0
1440140932,40,9.3,
```

## Socket.io
SiriDB HTTP has socket.io support when `enable_socket_io` is set to `True` in the configuration file.

For Socket.io the following events are available:
- `db-info`
- `auth fetch`
- `auth login`
- `auth logout`
- `query`
- `insert`

The result for an event contains a status code and data object. The status codes are equal to HTTP status codes. For example the success code is 200.
When the status code is anything other than 200, the data object will be a string representing the error message.

Example of using Socket.io with HTML/JavaScript:
```html
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.1/socket.io.js"></script>
</head>
<body>
<script>
// create socket, assuming SiriDB HTTP is running on localhost and listening to port 5050
var socket = io.connect("http://127.0.0.1:5050");

// get database and version information
socket.emit('db-info', null, function (status, data) {
    console.log(status, data);
});

// authenticate using user iris with password siri
socket.emit('auth login', {username: "iris", password: "siri"}, function (status, data) {
    console.log(status, data);

    // if successful perform a query
    if (status == 200) {
        socket.emit('query', {query: "list series limit 5"}, function (status, data) {
            console.log(status, data);
        });
    }
});
</script>
</body>
</html>
```

## Web interface
SiriDB has an optional web interface that can be enabled by setting `enable_web` to `True`. This web interface will ask for user authentication if `enable_authentication` is set to `True`. Only the `user` that is configured in the configuration file is allowed to login unless `enable_multi_user` is set to `True`.

The Web interface allows you to run queries and insert data using JSON format.

## SSL (HTTPS)
SSL (HTTPS) support can be enabled by setting `enable_ssl` to `True`. When enabled the `crt_file` and `key_file` in section `[SSL]` must be set.

