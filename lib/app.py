import signal
import asyncio
import functools
import logging
from aiohttp.web import Application


class App(Application):

    def __init__(self, *args, port=8080, **kwargs):
        self.port = port
        super().__init__(*args, **kwargs)

    def start(self):
        # add signal handlers
        for signame in ('SIGINT', 'SIGTERM'):
            self.loop.add_signal_handler(
                getattr(signal, signame),
                functools.partial(self.stop, signame))

        self.loop.run_until_complete(
            self.loop.create_server(self.make_handler(), '0.0.0.0', self.port))

        self.loop.run_forever()

        self.loop.close()


    def stop(self, signame):
        logging.warning(
            'Signal \'{}\' received, stop SiriDB Webserver!'
            .format(signame))

        self.loop.stop()