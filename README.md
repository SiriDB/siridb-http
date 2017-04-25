SiriDB HTTP
===========
SiriDB HTTP provides an optional web interface and HTTP api for SiriDB.

---------------------------------------
  * [Features](#features)
  * [Installation](#installation)
    * [Ubuntu](#ubnutu)  

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
For Ubnutu 64bit we have a deb package available which can be doenloaded [here](https://github.com/transceptor-technology/siridb-http/releases/latest).

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

  

 
