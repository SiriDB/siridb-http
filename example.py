#!/usr/bin/python3
import asyncio
import aiohttp
import time
import json
import logging
import argparse


class Auth:

    def __init__(self, secret, url, only_secret=False):
        self.url = url
        self._secret = secret
        self._token = None
        self._refresh_ts = None
        self._refresh_token = None
        self._only_secret = only_secret

    async def get_header(self, content_type='application/json'):
        if not self._secret:
            return {
                'Content-Type': content_type
            }
        if self._only_secret:
            return {
                'Authorization': 'Secret {}'.format(self._secret),
                'Content-Type': content_type
            }
        if self._token is None:
            await self._get_token()
        elif time.time() > self._refresh_ts:
            await self._refresh()
        return {
            'Authorization': 'Token {}'.format(self._token),
            'Content-Type': content_type
        }

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


async def _query(auth, data, headers):
    async with aiohttp.ClientSession() as session:
        async with session.post(
                '{}/query'.format(auth.url),
                data=data,
                headers=headers) as resp:
            status = resp.status
            res = await resp.text()

    return res, status


async def query_json(auth, q):
    data = {'query': q}
    headers = await auth.get_header()
    res, status = await _query(auth, json.dumps(data), headers)
    return json.loads(res), status


async def query_csv(auth, q):
    data = '"query","{}"'.format(q.replace('"', '""'))
    headers = await auth.get_header(content_type='application/csv')
    return await _query(auth, data, headers)


async def example_show(args, auth):
    res, status = await query_json(auth, 'show')
    if status == 200:
        for item in res['data']:
            print('{name:.<20}: {value}'.format(**item))
    else:
        print('Error: {}'.format(res.get('error_msg', status)))


async def example_query(args, auth):
    res, status = await query_csv(auth, args.query)
    print(res)


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
        default='',
        help='Authenticate using a secret')

    parser.add_argument(
        '-o', '--only-secret',
        action='store_true',
        help='Only authenticate using the secret. ' +
             '(can only be used if a token is not required)')

    parser.add_argument(
        '-q',
        '--query',
        type=str,
        default='',
        help='Send a query, output is parsed as csv')

    args = parser.parse_args()
    loop = asyncio.get_event_loop()
    auth = Auth(args.secret, args.url, args.only_secret)
    if args.query:
        loop.run_until_complete(example_query(args, auth))
    else:
        loop.run_until_complete(example_show(args, auth))
