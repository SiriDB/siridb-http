import asyncio
import json
import base64
import logging
from aiohttp_session.cookie_storage import AbstractStorage
from aiohttp_session.cookie_storage import Session
from .cipher import Cipher


class EncryptedCookieStorage(AbstractStorage):
    '''Encrypted JSON storage.'''

    def __init__(self, *, cookie_name="AIOHTTP_SESSION",
                 domain=None, max_age=None, path='/',
                 secure=None, httponly=True):

        super().__init__(
            cookie_name=cookie_name,
            domain=domain,
            max_age=max_age,
            path=path,
            secure=secure,
            httponly=httponly)

        self._cipher = Cipher()

    async def load_session(self, request):
        cookie = self.load_cookie(request)
        if cookie is None:
            return Session(None, data=None, new=True, max_age=self.max_age)
        else:
            try:
                data = self._cipher.decrypt(cookie)
            except Exception as e:
                logging.error('Received invalid cookie: {}'.format(cookie))
                return Session(None, data=None, new=True, max_age=self.max_age)
            else:
                return Session(
                    None,
                    data=data,
                    new=False,
                    max_age=self.max_age)

    async def save_session(self, request, response, session):
        logging.warning('Saving session...')
        if session.empty:
            logging.warning('Saving empty...')
            return self.save_cookie(response, session._mapping)

        self.save_cookie(response, self._cipher.encrypt(
            self._get_session_data(session)).decode('utf-8'))


