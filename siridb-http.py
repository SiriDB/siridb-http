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
import sys
import setproctitle
import configparser
from siridb.connector import SiriDBClient
from lib.version import __version__
from lib.version import __maintainer__
from lib.version import __email__
from lib.logger import setup_logger
from lib.app import App
from lib.utils import get_hostlist

if __name__ == '__main__':
    setproctitle.setproctitle('siridb-http')

    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-c',
        '--config',
        type=str,
        default='/etc/siridb/siridb-http.conf',
        help='Configuration file.')

    parser.add_argument(
        '-v', '--version',
        action='store_true',
        help='print version information and exit')

    parser.add_argument(
        '-l', '--log-level',
        default='info',
        help='set the log level (default: info)',
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
        sys.exit('''
SiriDB HTTP Server {version}
Maintainer: {maintainer} <{email}>
Home-page: http://siridb.net
        '''.strip().format(version=__version__,
                           maintainer=__maintainer__,
                           email=__email__))

    config = configparser.RawConfigParser()

    with open(args.config, 'r', encoding='utf-8') as f:
        config.read_file(f)

    try:
        config.hostlist = get_hostlist(config.get('Database', 'servers'))

    except ValueError:
        sys.exit('Invalid servers in configuration file "{}", '
                 'expecting something like: '
                 'server1.local:9000,[::1]:9000 ...'
                 .format(args.config))

    siri = SiriDBClient(
        username=config.get('Database', 'user'),
        password=config.get('Database', 'password'),
        dbname=config.get('Database', 'dbname'),
        hostlist=config.hostlist,
        keepalive=True)

    app = App(config=config, siri=siri, debug_mode=args.debug)
    app.start()
    # bye
    sys.exit(0)
