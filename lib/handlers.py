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
from aiohttp_session import get_session


_UNSUPPORTED, _MSGPACK, _QPACK, _JSON, _CSV = range(5)


def static_factory(route, path):
    async def handle_static_file(request):
        request.match_info['filename'] = path
        return await route._handle(request)
    return handle_static_file


def pack_exception(fun):
    def wrapper(self, data, status=200):
        if isinstance(data, Exception):
            exc = data
            data = {'error_msg': str(exc)}
            status = self._MAP_ERORR_STATUS.get(exc.__class__, 500)
        return fun(self, data, status)
    return wrapper


def checksiri(fun):
    async def wrapper(self, request):
        if self.db['dbname'] is None:
            return await self.handle_waiting(request)
        return await fun(self, request)
    return wrapper


def authentication(fun):
    async def wrapper(self, request):
        if self.auth is not None:
            try:
                authorization = \
                    self._TOKEN_RX.match(request.headers['Authorization'])
                if not authorization:
                    if not self.token_required:
                        authorization = self._SECRET_RX.match(
                            request.headers['Authorization'])
                        if not authorization:
                            raise AuthenticationError(
                                'Missing "Token" or "Secret" in headers')
                        secret = authorization.group(1)
                        self.auth.validate_secret(secret)
                        siri = self.siri
                    else:
                        raise AuthenticationError('Missing "Token" in headers')
                else:
                    token = authorization.group(1)
                    self.auth.validate_token(token)
                    siri = self.siri
            except Exception as resp:
                try:
                    session = await get_session(request)
                    if session.new:
                        raise resp
                    else:
                        user = session.get('user')
                        if user is None:
                            raise AuthenticationError('Invalid session request.')

                        siri = self.siri_connections.get(user)
                        if siri is None:
                            raise AuthenticationError(
                                'No SiriDB connection is found for user "{}"'
                                .format(user))
                except Exception as resp:
                    try:
                        ct = self._get_content_type(request)
                    except Exception as e:
                        logging.error(e)
                        ct = _UNSUPPORTED
                    finally:
                        return self._RESPONSE_MAP[ct](
                            self,
                            AuthenticationError(resp))
        return await fun(self, request, siri)
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
    _REFRESH_RX = re.compile('^Refresh ([^\s]+)$', re.IGNORECASE)
    _QUERY_MAP = {
        _MSGPACK: lambda content:
            msgpack.unpackb(content, use_list=False, encoding='utf-8'),
        _CSV: lambda content: csvhandler.loads(content, is_query=True),
        _JSON: lambda content: json.loads(content.decode('utf-8')),
        _QPACK: qpack.unpackb
    }
    _INSERT_MAP = {
        _MSGPACK: lambda content:
            msgpack.unpackb(content, use_list=False, encoding='utf-8'),
        _CSV: csvhandler.loads,
        _JSON: json.loads,
        _QPACK: qpack.unpackb
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.router.add_route('GET', '/db-info', self.handle_db_info)
        self.router.add_route('POST', '/insert', self.handle_insert)
        self.router.add_route('POST', '/query', self.handle_query)

        if self.config.getboolean('Configuration', 'enable_web'):
            logging.info('Enable Web Server routes')
            # Read static and template paths
            static_path = os.path.join(utils.get_path(), 'static')
            templates_path = os.path.join(utils.get_path(), 'templates')

            # Setup static route
            static = self.router.add_static('/static/', static_path)

            self.router.add_route('GET', '/', self.handle_main)
            self.router.add_route(
                'POST',
                '/auth/secret',
                self.handle_auth_secret)
            self.router.add_route(
                'POST',
                '/auth/login',
                self.handle_auth_login)
            self.router.add_route(
                'GET',
                '/auth/fetch',
                self.handle_auth_fetch)
            self.router.add_route(
                'GET',
                '/auth/logoff',
                self.handle_auth_logoff)
            self.router.add_route('GET', '/temp', self.handle_temp)
            self.router.add_route(
                'GET',
                '/favicon.ico',
                static_factory(static, 'favicon.ico'))

            # Setup templates
            setup_template_loader(templates_path)

        if self.auth is not None:
            logging.info('Enable Authentication routes')
            self.router.add_route('POST', '/get-token', self.handle_get_token)
            self.router.add_route(
                'POST',
                '/refresh-token',
                self.handle_refresh_token)

    async def handle_auth_secret(self, request):
        secret = (await request.json())['secret']
        self.auth.validate_secret(secret)
        session = await get_session(request)
        session['user'] = self.config.get('Database', 'user')
        return self._response_json({'user': session['user']})

    async def _save_session(self, request, user):
        session = await get_session(request)
        session['user'] = user
        return {'user': user}

    async def handle_auth_login(self, request):
        login = await request.json()
        if login['username'] == self.config.get('Database', 'user'):
            if login['password'] != self.config.get('Database', 'password'):
                resp = AuthenticationError('Username or password incorrect')
            else:
                resp = await self._save_session(
                    request,
                    self.config.get('Database', 'user'))
        else:
            resp = AuthenticationError('Multiple user login is not allowed')
        return self._response_json(resp)

    async def handle_auth_fetch(self, request):
        if self.auth is None:
            return self._response_json({
                'user': self.config.get('Database', 'user'),
                'authRequired': False
            })
        session = await get_session(request)
        return self._response_json({
            'user': session.get('user'),
            'authRequired': True
        })

    async def handle_auth_logoff(self, request):
        session = await get_session(request)
        session.clear()
        return self._response_json({'user': session.get('user')})

    @template('waiting.html')
    async def handle_waiting(self, request):
        return {'debug': self.debug_mode}

    @checksiri
    @template('main.html')
    async def handle_main(self, request):
        return {'debug': self.debug_mode}

    @template('base.html')
    async def handle_temp(self, request):
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

    @authentication
    async def handle_insert(self, request, siri):
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
                resp = await siri.insert(data)
            except Exception as e:
                logging.error(e)
                resp = e
        finally:
            return self._RESPONSE_MAP[ct](self, resp)

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

    @authentication
    async def handle_query(self, request, siri):
        content = await request.read()
        ct = _UNSUPPORTED
        try:
            ct = self._get_content_type(request)
            query = self._QUERY_MAP[ct](content)
            if isinstance(query, dict):
                query = query['query']
        except Exception as e:
            logging.error(e)
            resp = QueryError(
                'Error while reading query: {}'.format(str(e)))
        else:
            logging.debug('Process query: {}'.format(query))
            try:
                resp = await siri.query(query)
            except Exception as e:
                logging.error(e)
                resp = e
        finally:
            return self._RESPONSE_MAP[ct](self, resp)

    async def handle_get_token(self, request):
        ct = _UNSUPPORTED
        try:
            authorization = \
                self._SECRET_RX.match(request.headers['Authorization'])
            if not authorization:
                raise ValueError('Missing "Secret" in headers')
            secret = authorization.group(1)
            ct = self._get_content_type(request)
        except Exception as e:
            resp = e
        else:
            resp = self.auth.get_token(secret)
        finally:
            return self._RESPONSE_MAP[ct](self, resp)

    async def handle_refresh_token(self, request):
        ct = _UNSUPPORTED
        try:
            authorization = \
                self._REFRESH_RX.match(request.headers['Authorization'])
            if not authorization:
                raise ValueError('Missing "Refresh" in headers')
            refresh = authorization.group(1)
            ct = self._get_content_type(request)
        except Exception as e:
            resp = e
        else:
            try:
                resp = self.auth.refresh_token(refresh)
            except Exception as e:
                resp = e
        finally:
            return self._RESPONSE_MAP[ct](self, resp)

    _RESPONSE_MAP = {
        _MSGPACK: _response_msgpack,
        _CSV: _response_csv,
        _QPACK: _response_qpack,
        _JSON: _response_json,
        _UNSUPPORTED: _response_text
    }
