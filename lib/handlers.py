import os
import aiohttp
import json
import msgpack
import qpack
import logging
import re
import csvloader
from trender.aiohttp_template import setup_template_loader
from trender.aiohttp_template import template
from siridb.connector.lib.exceptions import InsertError
from siridb.connector.lib.exceptions import QueryError
from siridb.connector.lib.exceptions import ServerError
from siridb.connector.lib.exceptions import PoolError
from siridb.connector.lib.exceptions import UserAuthError
from siridb.connector.lib.exceptions import AuthenticationError
from . import csvhandler
from . import utils


_UNSUPPORTED, _MSGPACK, _QPACK, _JSON, _CSV = range(5)


def static_factory(route, path):
    async def handle_static_file(request):
        request.match_info['filename'] = path
        return await route.handle(request)
    return handle_static_file


def pack_exception(fun):
    def wrapper(self, data, status=200):
        if isinstance(data, Exception):
            exc = data
            data = {'error_msg': str(exc)}
            status = self._MAP_ERORR_STATUS.get(exc.__class__, 500)
        return fun(self, data, status)
    return wrapper


class Handlers:

    _MAP_ERORR_STATUS = {
        InsertError: 500,
        QueryError: 500,
        ServerError: 503,
        PoolError: 503,
        UserAuthError: 401,
        AuthenticationError: 422}

    _SECRET_RX = re.compile('^Secret ([^\s]+)$', re.IGNORECASE)
    _TOKEN_RX = re.compile('^Token ([^\s]+)$', re.IGNORECASE)
    _QUERY_MAP = {
        _MSGPACK: lambda content:
            msgpack.unpackb(content, use_list=False, encoding='utf-8'),
        _CSV: lambda content: csvloader.loads(content)[0][0],
        _JSON: json.loads,
        _QPACK: qpack.unpackb
    }
    _INSERT_MAP = {
        _MSGPACK: lambda content:
            msgpack.unpackb(content, use_list=False, encoding='utf-8'),
        _CSV: csvhandler,
        _JSON: json.loads,
        _QPACK: qpack.unpackb
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.router.add_route('GET', '/db-info', self.handle_db_info)
        self.router.add_route('POST', '/insert', self.handle_insert)
        self.router.add_route('POST', '/query', self.handle_query)

        if self.config.getboolean('Configuration', 'enable_web'):
            # Read static and template paths
            static_path = os.path.join(utils.get_path(), 'static')
            templates_path = os.path.join(utils.get_path(), 'templates')

            # Setup static route
            static = self.router.add_static('/static/', static_path)

            self.router.add_route('GET', '/', self.handle_main)
            self.router.add_route(
                'GET',
                '/favicon.ico',
                static_factory(static, 'favicon.ico'))

            # Setup templates
            setup_template_loader(templates_path)

        if self.auth is not None:
            self.router.add_route('POST', '/get-token', self.handle_get_token)
            self.router.add_route(
                'POST',
                '/refresh-token',
                self.handle_refresh_token)

    @template('base.html')
    async def handle_main(self, request):
        return {'debug': self.debug_mode}

    async def handle_db_info(self, request):
        return self._response_json(self.db)

    def _response_text(self, text, status=200):
        if isinstance(text, Exception):
            exc = text
            text = str(exc)
            status = self._MAP_ERORR_STATUS.get(exc.__class__, 500)
        return aiohttp.web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=text.encode('utf-8'),
            charset='UTF-8',
            content_type='text/plain',
            status=status)

    @pack_exception
    def _response_csv(self, text, status=200):
        return aiohttp.web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=csvdump(data),
            charset='UTF-8',
            content_type='application/csv',
            status=status)

    @pack_exception
    def _response_json(self, data, status=200):
        return aiohttp.web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=json.dumps(data).encode('utf-8'),
            charset='UTF-8',
            content_type='application/json',
            status=status)

    @pack_exception
    def _response_msgpack(self, data, status=200):
        return aiohttp.web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=msgpack.packb(data),
            charset='UTF-8',
            content_type='application/x-msgpack',
            status=status)

    @pack_exception
    def _response_qpack(self, data, status=200):
        return aiohttp.web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=qpack.packb(data),
            charset='UTF-8',
            content_type='application/x-qpack',
            status=status)

    async def handle_insert(self, request):
        content = await request.read()
        ct = _UNSUPPORTED
        try:
            ct = self._get_content_type(request)
            data = self._INSERT_MAP[ct](content)
        except Exception as e:
            resp = InsertError(
                'Error while reading data: {}'.format(str(e)))
        else:
            try:
                resp = await self.siri.insert(data)
            except Exception as e:
                logging.error(e)
                resp = e
        finally:
            return _RESPONSE_MAP[ct](self, resp)

    @staticmethod
    def _get_content_type(request):
        ct = request.content_type.lower().split(';')[0]
        if ct.endswith('x-msgpack'):
            return _MSGPACK
        if ct.endswith('json'):
            return _JSON
        if ct.endswith('x-qpack'):
            return _QPACK
        if ct.endswith('csv'):
            return _CSV
        raise TypeError('Unsupported content type: {}'.format(ct))

    async def handle_query(self, request):
        content = await request.read()
        ct = _UNSUPPORTED
        try:
            ct = self._get_content_type(request)
            query = self._QUERY_MAP[ct](content)
        except Exception as e:
            resp = QueryError(
                'Error while reading query: {}'.format(str(e)))
        else:
            logging.debug(query)
            try:
                resp = await self.siri.query(query)
            except Exception as e:
                logging.error(e)
                resp = e
        finally:
            return _RESPONSE_MAP[ct](self, resp)

    async def handle_get_token(self, request):
        authorization = self._SECRET_RX.match(request.headers['Authorization'])
        if not authorization:
            resp = Exception('Missing "Secret" in headers')
        else:
            ct = request.content_type.lower().split(';')[0]

    async def handle_refresh_token(self, request):
        authorization = self._TOKEN_RX.match(request.headers['Authorization'])

    _RESPONSE_MAP = {
        _MSGPACK: _response_msgpack,
        _CSV: _response_csv,
        _QPACK: _response_qpack,
        _JSON: _response_json,
        _UNSUPPORTED: _response_text
    }
