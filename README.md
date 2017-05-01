SiriDB HTTP
===========
![alt SiriDB HTTP](/siridb-http.png?raw=true)

SiriDB HTTP provides an optional web interface and HTTP api for SiriDB.

---------------------------------------
  * [Features](#features)
  * [Installation](#installation)
    * [Ubuntu](#ubuntu)
    * [From source](#from-source)
  * [Configuration](#configuration)
    * [Multi server support](#multi-server-support)
  * [API](#api)
    * [Authentication](#authentication)
      * [Secret](#secret)
      * [Token](#token)
      * [Session](#session)
    * [Query](#query)
      * [JSON](#query-json)
      * [CSV](#query-csv)
      * [MsgPack](#query-msgpack)
      * [QPack](#query-qpack)
    * [Insert](#insert)
      * [JSON, MsgPack, QPack](#insert-json)
      * [CSV](#insert-csv)
  * [Web Interface](#web-interface)
---------------------------------------

## Features
  - Optional Web interface for sending queries and inserting data.
  - SSL (HTTPS) support.
  - Token Authentication.
  - Multi user support for the web interface.
  - Support for JSON, CSV, MsgPack and QPack.

## Installation
SiriDB HTTP is written in Python but uses C libraries for handling data.

### Ubuntu
For Ubnutu we have a deb package available which can be downloaded [here](https://github.com/transceptor-technology/siridb-http/releases/latest).

### From source
Clone the project using git. (we assume git is installed)
```
git clone https://github.com/transceptor-technology/siridb-http
```

Install Python packages (we assume Python3 and pip are installed)
```
cd siridb-http
pip3 install -f requirements.txt 
```

Install node packages (we assume the node package manager is installed)
```
cd src
npm install
```

Install less (for compiling less to css)
```
npm install -g less less-plugin-clean-css
```

Compile less and run webpack
```
cd ..
python3 build.py
```

Copy (and change) the configuration file
```
cp siridb-http.conf /etc/siridb/siridb-http.conf
# now review the file and change values if required for example using vim:
# vim /etc/siridb/siridb-http.conf
```

Finished, you can now start SiriDB HTTP
```
python3 siridb-http.py
```

## Configuration
The default path for the configuration file is `/etc/siridb/siridb-http.conf`. When another location is preferred you can start SiriDB HTTP with the argument flag `--config <path/file>`. By default siridb http will listen on port 8080 but this default can be changed by setting `port` within the `[Configuration]` section in the config file.

### Multi server support
SiriDB can scale across multiple pools and can be made high-available by adding two servers to each pool. For example you could have four siridb servers sdb01, sdb02, sdb03 and sdb04 all listening to port 9000. In this example we assume sdb01 and sdb02 are members of `pool 0` and sdb03 and sdb04 are members of `pool 1`. 

We should now configure SiriDB to connect to both servers in pool 0 and/or pool 1. This ensures that queries and inserts always work, even when a server in the SiriDB cluster is not available for whatever reason. The only requirement is that each pool has at least one server online.

To configure SiriDB HTTP to connect to multiple servers a comma must be used as separator like this:
```
[Database]
servers = sdb01:9000,sdb02:9000,sdb03:9000,sdb04:9000
```

## API
SiriDB HTTP has a HTTP api which can be used to insert and query a SiriDB cluster.

### Authentication
Authentication is required when `enable_authentication` is set to `True` in the configuration file. Different methods for authentication can be used, like providing a token in each request or using session authentication with a username/password. When authentication is disabled the `/insert` and `/query` handlers can be used directly without any authentication, privileges are defined by the user and is configured in the configuration file.

#### Secret
A secret can only be used if `[Token]is_required` is set to `False`. A secret can be configured in the configuration file by setting the `secret` variable in section `[Secret]`. If no secret is specified, one will be created automatically and can be found in a hidden file: `.secret` in the application path.

To use the secret we need to set the Authorization header field for each request. This is an example header for when we want to post and receive JSON data using a secret **MySecretString**. (Note that the Authorization field is prefixed with `Secret ` which is required) 
```
Authorization: 'Secret MySecretString'
Content-Type:  'application/json'
```

#### Token
A static secret cannot be used when `[Token]is_required` is set to `True`. Instead a token can be used which can be requested by using the secret. This is slightly more secure since the secret will be used only once and all other communication is done by rotation tokens.

For receiving a token the following request should be used: (... must be replaced with your secret)
```
type:      POST
uri:       /get-token
header:    Authorization: 'Secret ...'
           Content-Type:  'application/json'                    
```

This is an example response: (note that the `expiration_time` can be set within the `[Token]` section in the configuration file)
```json
{
    "token": "a_token_string",
    "expires_in": 3600,
    "refresh_token": "a_refresh_token_string"
}
```

A token can be used by including the `Authorization` field in your header. For example:
```
Authorization: 'Token MyTokenString'
Content-Type:  'application/json'
```

In case the expiration time is passed the token cannot be used anymore and a new token must be requested using the refresh token. A token refresh can be done by using the following request: (... must be replaced with your refresh token)
```
type:      POST
uri:       /refresh-token
header:    Authorization: 'Refresh ...'
           Content-Type:  'application/json'                    
```

The response for a refresh token is similar to a get-token request.

#### Session
SiriDB HTTP has session support and exposes the following uri's for handling session authentication:
- /auth/secret
- /auth/login
- /auth/fetch
- /auth/logoff

##### /auth/secret
This uri can be used to authenticate and create a session using the secret. The authenticated user will be the one specified in the configuration file.
```
type:      POST
uri:       /auth/secret
header:    Content-Type:  'application/json'
body:      {"secret": "my-secret-string"}
```

##### /auth/login
Login can be used to authenticate and create a SiriDB database user. If the option `enable_multi_user` within the section `[Session]` in the configuration file is set to `True`, any database user with at least `show` privileges can be used. In case multi user support is turned off, the only allowed user is the one configured in the configuration file.

```
type:      POST
uri:       /auth/login
header:    Content-Type:  'application/json'
body:      {"username": "my-username", "password": "my-secret-password"}
```

##### /auth/fetch
Fetch can be used to retrieve the current session user.
```
type:      GET
uri:       /auth/fetch
header:    Content-Type:  'application/json'
```
The response contains the current user and a boolean value to indicate if authentication is required. In case no user is logged on and authentication is required, the value for `user` will be `null`.

Example response:
```json
{
    "user": "logged_on_username",
    "authRequired": true
}
```

##### /auth/logoff
When calling this uri the current session will be cleared.
```
type:      GET
uri:       /auth/logoff
header:    Content-Type:  'application/json'
```
Response:
```json
{"user": null}
```

### Query
The `/query` POST handler can be used for querying SiriDB. SiriDB HTTP supports multiple formats that can be used by setting the `Content-Type` in the header.

#### Query JSON
Content-Type: application/json
Example:
```
{
    "query": "select mean(1h) => difference() from 'my-series'"
}
```

#### Query CSV
Content-Type: application/csv
Example:
```
"query","select min(1h) prefix 'min-', max(1h) prefix 'max-' from 'my-series'"
```
When double quotes are required in a query they can be escaped using two double  quotes, for example:
```
"query","select * from ""my-series"" after now - 7d"
```

#### Query MsgPack
Content-Type: application/x-msgpack
The format for msgpack is equal to JSON except that it should be packed using msgpack which results in a byte string.

#### Query QPack
Content-Type: application/x-qpack
The format for qpack is equal to JSON except that it should be packed using qpack which results in a byte string.

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

##### List CSV format
When using the list format, each row in the csv should contain a series name, timestamp and value.

Example list:
```csv
Series 001,1440138931,100
Series 003,1440138931,8.0
Series 001,1440140932,40
Series 002,1440140932,9.3
```
##### Table CSV format
A table format is more compact, especially if multiple series share points with equal timestamps. The csv should start with an empty field that is indicated with the first comma.

Example table:
```csv
,Series 001,Series 002,Series 003
1440138931,100,,8.0
1440140932,40,9.3,
```

## Web interface
SiriDB has an optional web interface that can be enabled by setting `enable_web` to `True`. This web interface will ask for user authentication if `enable_authentication` is set to `True`. Only the `user` that is configured in the configuration file is allowed to login unless `enable_multi_user` is set to `True`. 

The Web interface allows you to run queries and insert data using JSON format.

## SSL (HTTPS)
SSL (HTTPS) support can be enabled by setting `enable_ssl` to `True` in the `[Configuration]` section. When enabled the `crt_file` and `key_file` in section `[SSL]` must be set. As values it's possible to use relative paths. The certificate files will then be searched relative to the application path.
