'''Request handlers used by the aiohttp web server.

:copyright: 2016, Jeroen van der Heijden (Transceptor Technology)
'''

import logging
import base64
import msgpack
from aiohttp import web
from aiohttp_session import get_session
from urllib.parse import parse_qsl
from trender.aiohttp_template import template
from siridb import constants as c
from siridb import __version__
from siridb import csvhandler
from siridb.exceptions import (
    InsertError,
    PoolError,
    QueryError,
    ServerError,
    UserAuthError,
    NetworkAuthError,
    VerificationError,
    CleanTBException)
from .settings import Settings
from .shared import Shared
import json


settings = Settings()


def local_only(func):
    async def wrapper(self, request):
        remote_ip = self._get_remote_ip(request)
        if remote_ip not in ('127.0.0.1', '::1'):
            return self._response_exception(NetworkAuthError(
                'This request is only allowed for 127.0.0.1 or ::1 (localhost)'
                ' but got {}'.format(remote_ip)))
        return await func(self, request)
    return wrapper


class RequestHandlers:
    '''Request handlers.

    TODO:
        Make sure the connection will be closed after each request.
        If not a lot of ESTABLISHED connections might stay open when a
        browser or program is not closing the connection.
        To view the open connections: netstat -n -A inet
    '''

    _MAP_ERORR_STATUS = {
        InsertError: 500,
        QueryError: 500,
        ServerError: 503,
        PoolError: 503,
        UserAuthError: 401,
        NetworkAuthError: 403,
        VerificationError: 422}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._shared = Shared()

    async def _get_verified_username(self, request, session, post_params):
        '''Returns a SiriDB instance and a logged on user name.

        The method raises an exception when the user or database can not be
        verified.
        Possible exceptions: VerificationError
        '''
        dbname = post_params.get(
            'd',
            post_params.get(
                'database',
                request.match_info.get(
                    'dbname',
                    session.get(
                        'dbname',
                        None))))

        if dbname is None:
            raise VerificationError('Missing database name in request')

        try:
            siridb = self._shared.databases[dbname]
        except KeyError:
            raise VerificationError(
                'Database {!r} does not exist...'.format(dbname))

        username = post_params.get('u', post_params.get('username', None))
        if username is not None:
            password = post_params.get('p', post_params.get('password', None))
            if password is None:
                self._clean_session(session)
                raise VerificationError('Authentication error. User name '
                                        'supplied without a password')
            if not siridb.user_access.check_password(username, password):
                self._clean_session(session)
                raise VerificationError('Authentication error. User name or '
                                        'password incorrect')
            return siridb, username

        # TODO, verify this code below is still working
        auth_header = request.headers.get('Authorization', None)
        if auth_header is not None and auth_header.startswith('Basic '):
            auth_decoded = base64.decodestring(bytes(auth_header[6:], 'utf-8'))
            username, password = auth_decoded.decode().split(':', 2)
            if password is None:
                self._clean_session(session)
                raise VerificationError('Basic Authentication error. User '
                                        'name supplied without a password')
            if not siridb.user_access.check_password(username, password):
                self._clean_session(session)
                raise VerificationError(
                    'Basic Authentication error. User name or '
                    'password incorrect')
            return siridb, username

        if session.get('username') and session.get('dbname') == siridb.dbname:
            return siridb, session['username']

        raise VerificationError(
            'Authentication error, no signed in user found.')

    async def _get_post_params(self, request):
        data = await request.payload.read()

        post_params = {k: v for k, v in parse_qsl(data.decode('utf-8'))}
        if post_params:
            return post_params
        return {k: v for k, v in request.GET.items()}

    def _get_remote_ip(self, request):
        return request.transport.get_extra_info('peername')[0]

    @staticmethod
    def _clean_session(session):
        session.pop('username', None)

    def _response_text(self, text, status=200):
        return web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=text.encode('utf-8'),
            content_type='text/plain; charset=UTF-8',
            status=status)

    def _response_json(self, data, status=200):
        return web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=json.dumps(data).encode('utf-8'),
            content_type='application/json; charset=UTF-8',
            status=status)

    def _response_msgpack(self, data, status=200):
        return web.Response(
            headers={'ACCESS-CONTROL-ALLOW-ORIGIN': '*'},
            body=msgpack.packb(data),
            content_type='application/x-msgpack; charset=UTF-8',
            status=status)

    def _response_exception(self, exc):
        '''Get appropriate response for an exception.'''
        status = self._MAP_ERORR_STATUS.get(exc.__class__, None)

        if status is not None:
            logging.warning(exc)
            result = {c.ERROR_MSG: str(exc)}
            return self._response_json(result, status=status)

        # we should not get here; log full stack trace if we do
        logging.exception(exc)
        return self._response_text(
            'Unknown exception occurred, view the SiriDB server '
            'log for details', status=500)

    async def _insert_data(self, request, data):
        session = await get_session(request)
        post_params = await self._get_post_params(request)

        try:
            siridb, username = await self._get_verified_username(request,
                                                                 session,
                                                                 post_params)
        except Exception as e:
            return self._response_exception(e)

        remote_ip = self._get_remote_ip(request)

        try:
            result = await siridb.insert_points(username, remote_ip, data)
        except Exception as e:
            return self._response_exception(e)

        return self._response_json(result)

    async def handle_get_version(self, request):
        return self._response_msgpack(__version__)

    async def handle_get_databases(self, request):
        return self._response_msgpack(list(self._shared.databases))

    @local_only
    async def handle_load_databases(self, request):
        settings.read_config()
        self._shared.load_databases()
        return self._response_msgpack(
            {c.SUCCESS_MSG: 'load databases finished'})

    @template('base.html')
    async def handle_main(self, request):
        return {'databases': list(self._shared.databases),
                'debug': settings.debug}

    async def handle_sign_in(self, request):
        session = await get_session(request)
        post_params = await self._get_post_params(request)
        try:
            siridb, username = \
                await self._get_verified_username(request,
                                                  session,
                                                  post_params)
        except Exception as e:
            return self._response_exception(e)
        else:
            session['username'] = username
            session['dbname'] = siridb.dbname
            return self._response_text(username)

    async def handle_database_info(self, request, props=('aiohttp_server',
                                                         'dbname',
                                                         'license',
                                                         'python',
                                                         'status',
                                                         'time_precision',
                                                         'timezone',
                                                         'version',
                                                         'who_am_i')):
        session = await get_session(request)
        post_params = await self._get_post_params(request)
        try:
            siridb, username = await self._get_verified_username(request,
                                                                 session,
                                                                 post_params)
            remote_ip = self._get_remote_ip(request)
            # Raises Authentication error if not authenticated
            siridb.has_access(remote_ip, username, c.ACCESS_SHOW)
            try:
                siridb.properties.set_username(username)
                return self._response_json(
                    {prop: getattr(siridb.properties, prop)
                     for prop in props})
            finally:
                siridb.properties.set_username(None)
        except Exception as e:
            return self._response_exception(e)

    async def handle_query(self, request):
        session = await get_session(request)
        post_params = await self._get_post_params(request)
        try:
            siridb, username = await self._get_verified_username(request,
                                                                 session,
                                                                 post_params)
        except Exception as e:
            return self._response_exception(e)

        query = post_params.get('q', post_params.get('query', ''))
        time_precision = post_params.get('t',
                                         post_params.get('time_precision',
                                                         None))
        remote_ip = self._get_remote_ip(request)

        try:
            result = await siridb.query(query,
                                        time_precision,
                                        username,
                                        remote_ip,)
        except Exception as e:
            return self._response_exception(e)

        return self._response_json(result)

    async def handle_insert_json(self, request):
        try:
            data = await request.json()
        except ValueError:
            return self._response_exception(InsertError(
                'Error while parsing data, check if the body contains '
                'valid JSON data.'))

        return await self._insert_data(request, data)

    async def handle_insert_msgpack(self, request):
        content = await request.read()
        try:
            data = msgpack.unpackb(content, use_list=False, encoding='utf-8')
        except (msgpack.exceptions.UnpackException,
                msgpack.exceptions.ExtraData,
                msgpack.exceptions.UnpackValueError,
                TypeError) as e:
            return self._response_exception(InsertError(
                'Error while unpacking msgpack data: {}'.format(str(e))))

        return await self._insert_data(request, data)

    async def handle_insert_csv(self, request):
        content = await request.read()
        try:
            data = csvhandler.loads(content.decode('utf-8'))
        except (ValueError, TypeError, IndexError) as e:
            return self._response_exception(InsertError(
                'Error while unpacking csv data: {}'.format(str(e))))

        return await self._insert_data(request, data)

    async def handle_sign_out(self, request):
        session = await get_session(request)
        self._clean_session(session)
        return self._response_json({c.SUCCESS_MSG: 'Signed out from SiriDB'})

    async def handle_health_check(self, request):
        '''HealthCheck handler.

        Provides a GET handler which can be used as a health check. Returns
        a 201 when it's possible to query the given database. If the database
        has a status where it's NOT  possible to use queries, the request will
        return a HTML error code. (most likely 500)'''
        dbname = request.match_info['dbname']

        try:
            siridb = self._shared.databases[dbname]
        except KeyError:
            return self._response_exception(QueryError(
                'Database {!r} does not exist...'.format(dbname)))

        if siridb.status & (c.DB_LOADING |
                            c.DB_LOCK_REPLICATE |
                            c.DB_PAUSED |
                            c.DB_SHUTTING_DOWN):
            return self._response_exception(ServerError(
                'Status: {}'.format(siridb.properties.status)))

        return self._response_json(
            {c.SUCCESS_MSG: 'Status: {}'.format(siridb.properties.status)})


