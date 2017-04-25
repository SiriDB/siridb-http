SiriDB HTTP
===========
SiriDB HTTP provides an optional web interface and HTTP api for SiriDB.

---------------------------------------
  * [Features](#features)
  * [Installation](#installation)
    * [Ubuntu](#ubnutu)
    * [Other](#other)
    * [Configuration]

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
#### Using secret
A secret can only be used if `[Token]is_required` is set to `False`. The secret can be forced in the configuration file by setting the `secret` variable in section `[Secret]`. If no secret is specified, one will be auto-generated and can be found in a hidden file: `.secret` in the application path.

To use the secret we need to use set the Authorization field in header. This example is a header when we want to post and receive JSON data using a secret **MySecretString**. (Note that the Authorization field is prefixed with `Secret ` which is required) 
```
Authorization: 'Secret MySecretString'
Content-Type:  'application/json'
```


 
