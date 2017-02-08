import signal
import asyncio
import functools
import logging
from .handlers import Handlers
from aiohttp.web import Application
from .auth import Auth
from .secret import get_secret
from .encryptedcookiestorage import EncryptedCookieStorage
from aiohttp_session import session_middleware
from aiohttp.web_exceptions import HTTPException


class App(Handlers, Application):

    def __init__(self, config, siri, debug_mode=False):

        self.config = config
        self.port = self.config.get('Configuration', 'port')
        self.siri = siri
        self.siri_connections = {
            self.config.get('Database', 'user'): self.siri
        }
        self.debug_mode = debug_mode
        self.db = {
            'dbname': None,
            'version': None,
            'timePrecision': None
        }
        if self.config.getboolean('Configuration', 'enable_authentication'):
            self.auth = Auth(
                secret=get_secret(),
                expiration_time=self.config.getint('Token', 'expiration_time'))
            self.token_required = \
                self.config.getboolean('Token', 'is_required')
            middlewares = [
                self.error_middleware,
                session_middleware(EncryptedCookieStorage(
                    max_age=self.config.getint('Session', 'cookie_max_age')))]
        else:
            self.auth = None
            middlewares = ()

        super().__init__(middlewares=middlewares)

    async def _init_siridb(self):
        await self.siri.connect()
        try_again_in = 30
        while True:
            try:
                response = await self.siri.query(
                    'show dbname, version, time_precision')
            except Exception as e:
                logging.error(
                    'Cannot read properties from SiriDB: {}, '
                    'trying again in {} seconds...'
                    .format(e, try_again_in))
                await asyncio.sleep(try_again_in)
            else:
                break

        self.db['dbname'] = response['data'][0]['value']
        self.db['version'] = response['data'][1]['value']
        self.db['timePrecision'] = response['data'][2]['value']

        logging.info(
            'Connection made with database: {}'
            .format(self.db['dbname']))

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
        logging.info('Start listening on port {}'.format(self.port))
        self.loop.run_until_complete(self._init_siridb())

        try:
            self.loop.run_forever()
        except KeyboardInterrupt:
            pass
        finally:
            # cleanup signal handlers
            for signame in ('SIGINT', 'SIGTERM'):
                self.loop.remove_signal_handler(getattr(signal, signame))
            for siri in self.siri_connections.values():
                siri.close()
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

    async def error_middleware(self, app, handler):
        async def middleware_handler(request):
            try:
                return await handler(request)
            except HTTPException as e:
                raise e
            except Exception as e:
                logging.error(e)
                return self._response_json(
                    data={'error_msg': str(e)},
                    status=500)

        return middleware_handler
