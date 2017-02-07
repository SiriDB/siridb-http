'''Setup logging for SiriDB.

The logging options are set by the following startup arguments:

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

:copyright: 2015, Jeroen van der Heijden (Transceptor Technology)
'''

import logging.handlers
import colorlog

_LOG_DATE_FMT = '%y%m%d %H:%M:%S'

_MAP_LOGLEVELS = {
    'DEBUG': logging.DEBUG,
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'CRITICAL': logging.CRITICAL
}


def setup_logger(args):
    '''Setup logger.

    Positional arguments:
        args: usually an argparse object since we expect attributes like
        args.log_level etc.
    '''

    if args.log_colorized:
        # setup colorized formatter
        formatter = colorlog.ColoredFormatter(
            fmt='%(log_color)s[%(levelname)1.1s %(asctime)s %(module)s' +
                ':%(lineno)d]%(reset)s %(message)s',
            datefmt=_LOG_DATE_FMT,
            reset=True,
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white'},
            secondary_log_colors={},
            style='%')
    else:
        # setup formatter without using colors
        formatter = logging.Formatter(
            fmt='[%(levelname)1.1s %(asctime)s %(module)s:%(lineno)d] ' +
                '%(message)s',
            datefmt=_LOG_DATE_FMT,
            style='%')

    logger = logging.getLogger()

    logger.setLevel(_MAP_LOGLEVELS[args.log_level.upper()])

    if args.log_file_prefix:
        # create file handler
        ch = logging.handlers.RotatingFileHandler(
            args.log_file_prefix,
            maxBytes=args.log_file_max_size,
            backupCount=args.log_file_num_backups)

    else:
        # create console handler
        ch = logging.StreamHandler()

    # we can set the handler level to DEBUG since we control the root level
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(formatter)
    logger.addHandler(ch)
