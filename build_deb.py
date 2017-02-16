#!/usr/bin/python3

import sys
import os
import datetime
import platform
import subprocess
import shutil
import stat
import re
import argparse
from lib.version import __version__

CHANGELOG_FILE = 'ChangeLog'


def _get_changelog(version):
    with open('ChangeLog-{}'.format(version), 'r') as f:
        content = f.read()
    return content


def _get_distribution():
    '''Returns distribution code name. (Ubuntu)'''
    proc = subprocess.Popen(['lsb_release', '-c'], stdout=subprocess.PIPE)
    for line in proc.stdout:
        if line:
            return line.decode().split('\t')[1].strip()


if __name__ == '__main__':

    if not os.path.exists('static/js/bundle.min.js'):
        raise IOError(
            'Missing minified files do not exist, please run build.py')

    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-r',
        '--rev',
        type=int,
        default=0,
        help='Debian Revision number.')

    parser.add_argument(
        '-f',
        '--force',
        action='store_true',
        help='Overwrite existing build.')

    args = parser.parse_args()

    version = __version__
    if args.rev:
        version += '-{}'.format(args.rev)

    config = dict(
        version=version,
        name='Jeroen van der Heijden',
        email='jeroen@transceptor.technology',
        company='Transceptor Technology',
        company_email='info@transceptor.technology',
        datetime=datetime.datetime.utcnow().strftime(
                '%a, %d %b %Y %H:%M:%S') + ' +0000',
        architecture={
            '32bit': 'i386',
            '64bit': 'amd64'}[platform.architecture()[0]],
        archother={
            '32bit': 'i386',
            '64bit': 'x86_64'}[platform.architecture()[0]],
        homepage='http://siridb.net',
        distribution=_get_distribution(),
        curdate=datetime.datetime.utcnow().strftime('%d %b %Y'),
        year=datetime.datetime.utcnow().year,
        package='siridb-http',
        description='SiriDB HTTP Server',
        long_description='''
 SiriDB HTTP server which allowes multiple data formats and provides a web
 interface to a SiriDB Database.
        '''.rstrip(),
        explain='SiriDB HTTP Connection',
        depends='${shlibs:Depends}, '
                '${misc:Depends}'
    )

    with open(CHANGELOG_FILE, 'r') as f:
        current_changelog = f.read()

    if '{package} ({version})'.format(
            **config) in current_changelog:
        if not args.force:
            raise ValueError(
                'Version {} already build. Use -r <revision> to create a new '
                'revision number or use -f to overwrite the existing pacakge'
                .format(version))
        changelog = None
    else:
        changelog = _get_changelog(version)
        config.update(dict(
            changelog=changelog.strip()
        ))

    # Run setup.py to create executable
    subprocess.call(['pyinstaller', 'siridb-http.spec'])

    POSTINST = open(
        'deb/POSTINST', 'r').read().strip().format(**config)
    SYSTEMD = open(
        'deb/SYSTEMD', 'r').read().strip().format(**config)
    PRERM = open(
        'deb/PRERM', 'r').read().strip().format(**config)
    OVERRIDES = open(
        'deb/OVERRIDES', 'r').read().strip().format(**config)

    if changelog:
        CHANGELOG = open(
            'deb/CHANGELOG', 'r').read().strip().format(**config)
    CONTROL = open(
        'deb/CONTROL', 'r').read().strip().format(**config)
    MANPAGE = open(
        'deb/MANPAGE', 'r').read().strip().format(**config)
    COPYRIGHT = open(
        'deb/COPYRIGHT', 'r').read().strip().format(**config)
    RULES = open(
        'deb/RULES', 'r').read().strip()

    source_path = os.path.join('dist', 'siridb-http')
    if not os.path.isdir(source_path):
        sys.exit('ERROR: Cannot find path: {}'.format(source_path))

    deb_file = '{package}_{version}_{architecture}.deb'.format(**config)
    source_deb = os.path.join('build', deb_file)
    dest_deb = os.path.join('dist', deb_file)

    if os.path.exists(dest_deb):
        os.unlink(dest_deb)

    pkg_path = os.path.join(
        'build',
        '{}-{}'.format(config['package'], config['version']))
    debian_path = os.path.join(pkg_path, 'debian')

    pkg_src_path = os.path.join(pkg_path, 'src')

    debian_source_path = os.path.join(debian_path, 'source')

    target_path = os.path.join(pkg_src_path, 'usr', 'lib', 'siridb', 'http')

    os.makedirs(debian_source_path)
    shutil.copytree(source_path, target_path)

    cfg_path = os.path.join(pkg_src_path, 'etc', 'siridb')
    os.makedirs(cfg_path)
    shutil.copy('siridb-http.conf', cfg_path)

    systemd_path = os.path.join(target_path, 'systemd')
    os.makedirs(systemd_path)
    with open(os.path.join(
            systemd_path, '{package}.service'.format(**config)), 'w') as f:
        f.write(SYSTEMD)

    with open(os.path.join(debian_path, 'postinst'), 'w') as f:
        f.write(POSTINST)

    with open(os.path.join(debian_path, 'prerm'), 'w') as f:
        f.write(PRERM)

    with open(os.path.join(debian_path, 'source', 'format'), 'w') as f:
        f.write('3.0 (quilt)')

    with open(os.path.join(debian_path, 'compat'), 'w') as f:
        f.write('9')

    changelog_file = 'ChangeLog'

    if os.path.isfile(changelog_file):
        with open(changelog_file, 'r') as f:
            current_changelog = f.read()
    else:
        current_changelog = ''

    if changelog:
        changelog = CHANGELOG + '\n\n' + current_changelog

        with open(changelog_file, 'w') as f:
            f.write(changelog)

    shutil.copy(changelog_file, os.path.join(debian_path, 'changelog'))

    with open(os.path.join(debian_path, 'control'), 'w') as f:
        f.write(CONTROL)

    with open(os.path.join(debian_path, 'copyright'), 'w') as f:
        f.write(COPYRIGHT)

    rules_file = os.path.join(debian_path, 'rules')
    with open(rules_file, 'w') as f:
        f.write(RULES)

    os.chmod(rules_file, os.stat(rules_file).st_mode | stat.S_IEXEC)

    with open(os.path.join(debian_path, 'links'), 'w') as f:
        f.write('/usr/lib/siridb/http/{package} /usr/sbin/{package}\n'.format(
            **config))

    with open(os.path.join(debian_path, 'install'), 'w') as f:
        f.write('''src/usr /''')

    with open(os.path.join(debian_path, '{}.1'.format(
            config['package'])), 'w') as f:
        f.write(MANPAGE)

    with open(os.path.join(debian_path, '{}.manpages'.format(
            config['package'])), 'w') as f:
        f.write('debian/{}.1'.format(config['package']))

    with open(os.path.join(debian_path, '{}.lintian-overrides'.format(
            config['package'])), 'w') as f:
        f.write(OVERRIDES)

    subprocess.call(['debuild', '-us', '-uc', '-b'], cwd=pkg_path)

    if os.path.exists(source_deb):
        shutil.move(source_deb, dest_deb)
        shutil.rmtree('build')
        sys.exit('Successful created package: {}'.format(dest_deb))
    else:
        sys.exit('ERROR: {} not created'.format(source_deb))
