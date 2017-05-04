import sys
import os
import re


def get_path():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(os.path.realpath(sys.executable))
    return os.path.dirname(os.path.dirname(os.path.realpath(__file__)))


def get_hostlist(s):
    hostlist = []
    for addr in re.split(r'\s+|\s*,\s*', s):
        parts = addr.split(':')

        # IPv4
        if len(parts) == 1:
            hostlist.append((parts[0], 9000))
            continue

        if len(parts) == 2:
            hostlist.append((parts[0], int(parts[1])))
            continue

        # IPv6
        if addr[0] != '[':
            hostlist.append((addr, 9000))
            continue

        if addr[-1] == ']':
            hostlist.append((addr[1: -1], 9000))
            continue

        addr = ':'.join(parts[:-1])
        hostlist.append((addr[1: -1], int(parts[-1])))

    return hostlist

if __name__ == '__main__':
    print(get_hostlist('siridb01.local:9000, siridb02.local:9001'))
    print(get_hostlist('siridb01.local'))
    print(get_hostlist('10.2.3.4'))
    print(get_hostlist('::1'))
    print(get_hostlist('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:5050,[::1]'))
