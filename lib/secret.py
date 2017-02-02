
import os
import logging
import uuid
import base64
from .utils import get_path


def gen_secret():
    return base64.encodestring(uuid.uuid4().bytes) \
        .decode('utf-8') \
        .rstrip('==\n')


def get_secret():
    fn = os.path.join(get_path(), '.secret')
    if os.path.exists(fn):
        with open(fn, 'r') as f:
            secret = f.read()
    else:
        logging.info('Generate new secret...')
        secret = gen_secret()
        with open(fn, 'w') as f:
            f.write(secret)
    logging.info('Using secret: {}'.format(secret))
    return secret
