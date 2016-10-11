#!/usr/bin/python3

'''Entry point for starting a SiriDB Web Server.

SiriDB is a high performance Time Series Database and this is a webserver
used to manage a database and adding support for JSON, MsgPack, CSV and
QPack data formats.

SiriDB Repo:

> wget -O - http://storage.googleapis.com/siridb_repo/
    jeroen@transceptor.technology.gpg.key | sudo apt-key add -
> sudo apt-add-repository "deb http://storage.googleapis.com/
    siridb_repo/ vivid main"

:copyright: 2016, Jeroen van der Heijden (Transceptor Technology)
'''
import logging
import argparse
import re
import setproctitle
from siridb.connector import SiriDBClient
from lib.version import __version__
from lib.version import __maintainer__
from lib.version import __email__
from lib.logger import setup_logger
from lib.app import App

async def on_prepare(request, response):
    print('dag dag')

if __name__ == '__main__':
    setproctitle.setproctitle('siridb-http')

    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-u',
        '--user',
        type=str,
        required=True,
        help='User for login.')

    parser.add_argument(
        '-p',
        '--password',
        type=str,
        required=True,
        help='Password to use when connecting to server.')

    parser.add_argument(
        '-d',
        '--dbname',
        type=str,
        required=True,
        help='Database name to connect to.')

    parser.add_argument(
        '-s',
        '--servers',
        type=str,
        default='localhost:9000',
        help='Servers to connect to. A host should be entered like '
        '<hostname_or_ip>:<port> Multiple hosts can be provided and should be '
        'separated with comma\'s or spaces.')

    parser.add_argument(
        '-v', '--version',
        action='store_true',
        help='print version information and exit')

    parser.add_argument(
        '-o', '--port',
        default=8080,
        help='specify alternate port',
        type=int)

    parser.add_argument(
        '-l', '--log-level',
        default='info',
        help='set the log level',
        choices=['debug', 'info', 'warning', 'error'])

    parser.add_argument(
        '--log-file-max-size',
        default=50000000,
        help='max size of log files before rollover ' +
        '(--log-file-prefix must be set)',
        type=int)

    parser.add_argument(
        '--log-file-num-backups',
        default=6,
        help='number of log files to keep (--log-file-prefix must be set)',
        type=int)

    parser.add_argument(
        '--log-file-prefix',
        help='path prefix for log files (when not provided we send the ' +
        'output to the console)',
        type=str)

    parser.add_argument(
        '--log-colorized',
        action='store_true',
        help='use colorized logging')

    parser.add_argument(
        '--debug',
        action='store_true',
        help='enable debug mode')

    args = parser.parse_args()

    # set-up the log handler with optional colors etc.
    setup_logger(args)

    # respond to --version argument
    if args.version:
        exit('''
SiriDB HTTP Server {version}
Maintainer: {maintainer} <{email}>
Home-page: http://siridb.net
        '''.strip().format(version=__version__,
                           maintainer=__maintainer__,
                           email=__email__))

    try:
        hostlist = [(server.strip(), int(port))
                    for server, port
                    in [s.split(':')
                        for s in re.split(r'\s+|\s*,\s*', args.servers)]]
    except ValueError:
        sys.exit('Invalid servers, expecting something like: '
                 'server1.local:9000,server2.local:9000 ...')

    siri = SiriDBClient(
        username=args.user,
        password=args.password,
        dbname=args.dbname,
        hostlist=hostlist,
        keepalive=True)

    app = App(port=args.port, siri=siri, debug=args.debug)
    app.start()
    # bye
    exit(0)
