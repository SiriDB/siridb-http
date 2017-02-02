import os
import aiohttp
import json
import msgpack
import qpack
import logging
import re
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

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        static_path = os.path.join(utils.get_path(), 'static')
        templates_path = os.path.join(utils.get_path(), 'templates')

        static = self.router.add_static('/static/', static_path)

        self.router.add_route('GET', '/', self.handle_main)
        self.router.add_route('GET', '/db-info', self.handle_db_info)
        self.router.add_route('POST', '/insert', self.handle_insert)
        self.router.add_route('POST', '/query', self.handle_query)
        self.router.add_route('POST', '/get-token', self.handle_get_token)
        self.router.add_route(
            'POST',
            '/refresh-token',
            self.handle_refresh_token)
        self.router.add_route(
            'GET',
            '/favicon.ico',
            static_factory(static, 'favicon.ico'))

        setup_template_loader(templates_path)

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

    async def _handle_insert_json(self, request):
        try:
            data = await request.json()
        except ValueError:
            resp = InsertError(
                'Error while parsing data, check if the body contains '
                'valid JSON data.')
        else:
            try:
                resp = await self.siri.insert(data)
            except Exception as e:
                logging.error(e)
                resp = e
        finally:
            return self._response_json(resp)

    async def _handle_insert_msgpack(self, request):
        content = await request.read()
        try:
            data = msgpack.unpackb(content, use_list=False, encoding='utf-8')
        except Exception as e:
            resp = InsertError(
                'Error while unpacking msgpack data: {}'.format(str(e)))
        else:
            try:
                resp = await self.siri.insert(data)
            except Exception as e:
                logging.error(e)
                resp = e
        finally:
            return self._response_msgpack(resp)

    async def _handle_insert_qpack(self, request):
        content = await request.read()
        try:
            data = qpack.unpackb(content)
        except Exception as e:
            resp = InsertError(
                'Error while unpacking qpack data: {}'.format(str(e)))
        else:
            try:
                resp = await self.siri.insert(data)
            except Exception as e:
                logging.error(e)
                resp = e
        finally:
            return self._response_qpack(resp)

    async def _handle_insert_csv(self, request):
        content = await request.read()
        try:
            data = csvhandler.loads(content.decode('utf-8'))
        except (ValueError, TypeError, IndexError) as e:
            resp = InsertError(
                'Error while unpacking csv data: {}'.format(str(e)))
        else:
            try:
                resp = await self.siri.insert(data)
            except Exception as e:
                logging.error(e)
                resp = e
            else:
                try:
                    resp = resp.get('success_msg')
                except:
                    logging.error('Unexpected response: {}'.format(resp))
                    resp = RuntimeError('Unexpected response: {}'.format(resp))
        finally:
            return self._response_text(resp)

    async def handle_insert(self, request):
        ct = request.content_type.lower().split(';')[0]
        if ct.endswith('x-msgpack'):
            return await self._handle_insert_msgpack(request)
        elif ct.endswith('json'):
            return await self._handle_insert_json(request)
        elif ct.endswith('x-qpack'):
            return await self._handle_insert_qpack(request)
        elif ct.endswith('csv'):
            return await self._handle_insert_csv(request)
        else:
            return self._response_text(
                TypeError('Unssupported content type: {}'.format(ct)))

    async def handle_query(self, request):
        print(request.headers)
        ct = request.content_type.lower().split(';')[0]
        content = await request.read()
        try:
            if ct.endswith('x-msgpack'):
                query = msgpack.unpackb(content, encoding='utf-8')
            elif ct.endswith('x-qpack'):
                query = qpack.unpackb(content)
            else:
                query = content
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
            if ct.endswith('x-msgpack'):
                return self._response_msgpack(resp)
            elif ct.endswith('json'):
                return self._response_json(resp)
            elif ct.endswith('x-qpack'):
                return self._response_qpack(resp)
            else:
                return self._response_text(str(resp))

    async def handle_get_token(self, request):
        authorization = _SECRET_RX.match(request.headers['Authorization'])
        if not authorization:
            resp = Exception('Missing "Secret" in headers')
        else:
            ct = request.content_type.lower().split(';')[0]
