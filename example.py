#!/usr/bin/python3
import asyncio
import aiohttp
import time
import json
import logging
import argparse


class Token:

    def __init__(self, secret, url):
        self.url = url
        self._secret = secret
        self._token = None
        self._refresh_ts = None
        self._refresh_token = None

    async def get(self):
        if self._token is None:
            await self._get_token()
        elif time.time() > self._refresh_ts:
            await self._refresh()
        return self._token

    def _update(self, content):
        self._refresh_token = content['refresh_token']
        self._refresh_ts = \
            int(time.time()) + content['expires_in'] // 2
        self._token = content['token']

    async def _get_token(self):
        headers = {
            'Authorization': 'Secret {}'.format(self._secret),
            'Content-Type': 'application/json'
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(
                    '{}/get-token'.format(self.url),
                    headers=headers) as resp:
                if resp.status == 200:
                    self._update(await resp.json())
                else:
                    logging.error('Error getting token: {}'.format(resp.status))

    async def _refresh(self):
        headers = {
            'Authorization': 'Refresh {}'.format(self._refresh_token),
            'Content-Type': 'application/json'
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(
                    '{}/refresh-token'.format(self.url),
                    headers=headers) as resp:
                if resp.status == 200:
                    self._update(await resp.json())
                else:
                    logging.error(
                        'Error getting token: {}'
                        .format(resp.status))


async def query(token, q):
    headers = {
        'Authorization': 'Token {}'.format(await token.get()),
        'Content-Type': 'application/json'
    }
    data = {
        'query': q
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(
                '{}/query'.format(token.url),
                data=json.dumps(data),
                headers=headers) as resp:
            status = resp.status
            res = await resp.json()

    return res, status


async def example(url, secret):
    token = Token(secret, url)
    res, status = await query(token, 'show')
    if status == 200:
        for item in res['data']:
            print('{name:.<20}: {value}'.format(**item))
    else:
        print('Error: {}'.format(res.get('error_msg', status)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-u',
        '--url',
        type=str,
        default='http://localhost:8080',
        help='SiriDB HTTP url')

    parser.add_argument(
        '-s',
        '--secret',
        type=str,
        required=True,
        help='secret')

    args = parser.parse_args()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(example(args.url, args.secret))
