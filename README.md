SiriDB HTTP
===========

Deb package:
wget https://storage.googleapis.com/siridb/http/siridb-http_0.0.2_amd64.deb

The SiriDB HTTP Server uses minified JavaScript and CSS files if not running in debug mode.

To create the minified files run build.py
./build.py


Start the HTTP SiriDB Server:

Note: its possible to use multiple siridb servers. The webserver will try to connect to each of the server
in the list. When your SiriDB pools has replica servers, you should include at least two servers so the HTTP server
can always process inserts and queries even if one SiriDB server is unavailable.

This will start
./siridb-http.py -u iris -p siri -d MyTimeseriesDatabase -s server01:9000,server02:9000,server03:9000 etc.




Curl:

```
curl -X POST -d '{"series-001": [[1481124760, 18]]}' -H "Content-Type:application/json" http://localhost:8080/insert
```


Misschien timestamps in ms in bash: `echo $(($(date +%s%N)/1000000))`

Copied from siridb-http.py --help:

  -h, --help            show this help message and exit
  -u USER, --user USER  User for login. If user is not given it's asked from
                        the tty.
  -p PASSWORD, --password PASSWORD
                        Password to use when connecting to server. If password
                        is not given it's asked from the tty.
  -d DBNAME, --dbname DBNAME
                        Database name to connect to. If dbname is not given
                        it's asked from the tty.
  -s SERVERS, --servers SERVERS
                        Servers to connect to. A host should be entered like
                        <hostname_or_ip>:<port> Multiple hosts can be provided
                        and should be separated with comma's or spaces.
  -v, --version         print version information and exit
  -o PORT, --port PORT  specify alternate port
  -l {debug,info,warning,error}, --log-level {debug,info,warning,error}
                        set the log level
  --log-file-max-size LOG_FILE_MAX_SIZE
                        max size of log files before rollover (--log-file-
                        prefix must be set)
  --log-file-num-backups LOG_FILE_NUM_BACKUPS
                        number of log files to keep (--log-file-prefix must be
                        set)
  --log-file-prefix LOG_FILE_PREFIX
                        path prefix for log files (when not provided we send
                        the output to the console)
  --log-colorized       use colorized logging
  --debug               enable debug mode
