import signal
import asyncio
import functools
import logging
from .handlers import Handlers
from aiohttp.web import Application
from .auth import Auth
from .secret import get_secret


class App(Handlers, Application):

    def __init__(self, config, siri, debug_mode=False):
        self.config = config
        self.port = self.config.get('Configuration', 'port')
        self.siri = siri
        self.debug_mode = debug_mode
        self.db = {
            'dbname': None,
            'version': None,
            'time_precision': None
        }
        self.auth = get_secret() if self.config.getboolean(
            'Configuration',
            'enable_authentication') else None
        super().__init__()

    def start(self):
        logging.info('Start SiriDB HTTP Server')
        # add signal handlers
        for signame in ('SIGINT', 'SIGTERM'):
            self.loop.add_signal_handler(
                getattr(signal, signame),
                functools.partial(self.stop, signame))

        handler = self.make_handler()

        try:
            srv = self.loop.run_until_complete(
                self.loop.create_server(handler, '0.0.0.0', self.port))
        except Exception as e:
            logging.error('Cannot start server: {}'.format(e))
            return

        self.loop.run_until_complete(self.siri.connect())

        try:
            response = self.loop.run_until_complete(
                self.siri.query('show dbname, version, time_precision'))
        except Exception as e:
            logging.error('Cannot read properties from SiriDB: {}'.format(e))
            return

        self.db['dbname'] = response['data'][0]['value']
        self.db['version'] = response['data'][1]['value']
        self.db['time_precision'] = response['data'][2]['value']

        try:
            self.loop.run_forever()
        except KeyboardInterrupt:
            pass
        finally:
            # cleanup signal handlers
            for signame in ('SIGINT', 'SIGTERM'):
                self.loop.remove_signal_handler(getattr(signal, signame))

            self.siri.close()
            srv.close()
            self.loop.run_until_complete(srv.wait_closed())
            self.loop.run_until_complete(self.shutdown())
            self.loop.run_until_complete(handler.finish_connections(60.0))
            self.loop.run_until_complete(self.cleanup())

        self.loop.close()
        logging.info('Bye!')

    def stop(self, signame):
        logging.warning(
            'Signal \'{}\' received, stop SiriDB HTTP Server!'
            .format(signame))

        self.loop.stop()
