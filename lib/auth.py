import time
import asyncio
from .secret import gen_secret

_REFRESH_TOKEN, _EXPIRATION_TIME = 0, 1


class AuthException(Exception):
    pass


class TokenException(Exception):
    pass


class Auth:

    def __inti__(self, secret, expiration_time=3600):
        self._secret = secret
        self._expiration_time = expiration_time
        self._tokens = {}
        self._task = asyncio.ensure_future(self._cleanup_loop)

    async def _cleanup_loop(self):
        await asyncio.sleep(1000)   # 1 second
        self._tokens = {
            t: v
            for t, v in self._tokes.items()
            if v[_EXPIRATION_TIME] < time.time()}

    def get_token(self, secret):
        if secret != self._secret:
            raise AuthException('Invalid secret')

        token = gen_secret()
        refresh_token = gen_secret()

        self._tokens[token] = [
            refresh_token,
            int(time.time()) + self._expiration_time]

        return {
            'token': token,
            'refresh_token': refresh_token,
            'expires_in': self._expiration_time}

    def validate_token(self, token):
        token = self._tokens.get(token)
        if token is None:
            raise TokenException('Unkown or expired token')
        if token[_EXPIRATION_TIME] < time.time():
            raise TokenException('Token is expired')

    def refresh_token(self, token, refresh_token):
        try:
            token = self._tokens.pop(token)
        except KeyError:
            raise TokenException('Unkown or expired token')
        if token[_EXPIRATION_TIME] < time.time():
            raise TokenException('Token is expired')

        return self.get_token(self._secret)
