import signal
import asyncio
import functools
import logging
import aiohttp
from trender.aiohttp_template import setup_template_loader
from trender.aiohttp_template import template
from aiohttp.web import Application
from siridb.connector import async_server_info


def static_factory(route, path):
    async def handle_static_file(request):
        request.match_info['filename'] = path
        return await route.handle(request)
    return handle_static_file


class App(Application):

    def __init__(self, *args, port=8080, siri=None, debug_mode=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.port = port
        self.siri = siri
        self.debug_mode = debug_mode

        route = aiohttp.web.StaticRoute(
            None,
            '/static/',
            'static')
        self.router.register_route(route)
        self.router.add_route('GET', '/', self.handle_main)
        setup_template_loader('./templates')

    def start(self):
        logging.info('Start SiriDB HTTP Server')
        # add signal handlers
        for signame in ('SIGINT', 'SIGTERM'):
            self.loop.add_signal_handler(
                getattr(signal, signame),
                functools.partial(self.stop, signame))

        handler = self.make_handler()
        srv = self.loop.run_until_complete(
            self.loop.create_server(handler, '0.0.0.0', self.port))

        self.loop.run_until_complete(
            self.siri.connect())

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


    def stop(self, signame):
        logging.warning(
            'Signal \'{}\' received, stop SiriDB HTTP Server!'
            .format(signame))

        self.loop.stop()


    @template('base.html')
    async def handle_main(self, request):
        return {'debug': self.debug_mode}