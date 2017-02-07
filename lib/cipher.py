'''Cipher class.
Used for cookies.
:copyright: 2015, Jeroen van der Heijden (Transceptor Technology)
'''

import base64
import random
import qpack
import string


def _get_random(chars=string.ascii_letters + string.digits, l=2):
    return ''.join([random.choice(chars) for _ in range(l)])


class Cipher:

    def __init__(self, rand=6):
        self._rand = rand

    def encrypt(self, raw):
        d = {_get_random(): _get_random() for _ in range(self._rand)}
        d['secret'] = raw
        secret = base64.b64encode(qpack.packb(d))
        return secret

    def decrypt(self, enc):
        enc = base64.b64decode(enc)
        d = qpack.unpackb(enc, decode='utf-8')
        return d['secret']