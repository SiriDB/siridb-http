SiriDB HTTP
===========
SiriDB HTTP provides an optional web interface and HTTP api for SiriDB.

---------------------------------------
  * [Features](#features)
  * [Installation](#installation)
    * [Ubuntu](#ubnutu)
    * [Other](#other)
    * [Configuration](#configuration)
  * [API](#api)
    * [Authentication](#authentication)
      * [Secret](#secret)
      * [Token](#token)

---------------------------------------

## Features
  - Optional Web interface for sending queries and inserting data.
  - SSL (HTTPS) support.
  - Token Authentication.
  - Multi user support for the web interface.
  - Support for JSON, CSV, MsgPack and QPack.

## Installation
SiriDB HTTP is written in Python but uses C libraries for handling data which makes it fast.

### Ubuntu
For Ubnutu we have a deb package available which can be downloaded [here](https://github.com/transceptor-technology/siridb-http/releases/latest).

### Other
Clone the project
```
git clone https://github.com/transceptor-technology/siridb-http
```

Install Python packages (we asume Python3 and pip are installed)
```
cd siridb-http
pip3 install -f requirements.txt 
```

Install node packages (we asume npm is installed)
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

### Configuration
The default path for the configuration file is `/etc/siridb/siridb-http.conf`. When another location is preferred you can start SiriDB HTTP with the argument flag `--config <path/file>`.

## API
SiriDB HTTP has an HTTP api which can be used to insert and query a SiriDB cluster.

### Authentication
Authentication is required when `enable_authentication` is set to `True` in the configuration file and several options are possible.

#### Secret
A secret can only be used if `[Token]is_required` is set to `False`. A secret can be configured in the configuration file by setting the `secret` variable in section `[Secret]`. If no secret is specified, one will be created automatically and can be found in a hidden file: `.secret` in the application path.

To use the secret we need to use set the Authorization header field for each request. This is an example header for when we want to post and receive JSON data using a secret **MySecretString**. (Note that the Authorization field is prefixed with `Secret ` which is required) 
```
Authorization: 'Secret MySecretString'
Content-Type:  'application/json'
```

#### Token
A static secret cannot be used when `[Token]is_required` is set to `True`. Instead a token can be used which can be requested by using the secret. This is slightly more secure since the secret will be used only once and all other communication is done by rotation tokens.

For receiving a token the following request should be used:
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

 
