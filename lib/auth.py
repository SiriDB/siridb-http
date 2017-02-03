import time
import asyncio
from .secret import gen_secret

_REFRESH_TOKEN, _EXPIRATION_TIME = 0, 1


class AuthException(Exception):
    pass


class TokenException(Exception):
    pass


class Auth:

    def __init__(self, secret, expiration_time=3600, cleanup=None):
        self._secret = secret
        self._expiration_time = expiration_time
        self._tokens = {}
        if cleanup is not None:
            self._task = asyncio.ensure_future(self._cleanup_loop(cleanup))

    async def _cleanup_loop(self, cleanup):
        await asyncio.sleep(60000)   # 1 minute
        self._tokens = {
            t: v
            for t, v in self._tokes.items()
            if v[_EXPIRATION_TIME] + cleanup < time.time()}

    def get_token(self, secret):
        self.validate_secret(secret)

        token = gen_secret()
        refresh_token = gen_secret()

        self._tokens[token] = [
            refresh_token,
            int(time.time()) + self._expiration_time]

        return {
            'token': token,
            'refresh_token': refresh_token,
            'expires_in': self._expiration_time}

    def validate_secret(self, secret):
        if self._secret != secret:
            raise AuthException('Invalid secret')

    def validate_token(self, token):
        token = self._tokens.get(token)
        if token is None:
            raise TokenException('Unkown or expired token')
        if token[_EXPIRATION_TIME] < time.time():
            raise TokenException('Token is expired')

    def refresh_token(self, refresh_token):
        for key, value in self._tokens.items():
            if value[_REFRESH_TOKEN] == refresh_token:
                token = key
                break
        else:
            raise TokenException('Invalid refresh token')

        self._tokens.pop(token)
        return self.get_token(self._secret)
