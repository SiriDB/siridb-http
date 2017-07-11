#!/usr/bin/python3
import os
import sys
import argparse
import subprocess
import base64


template = '''// +build !debug

package {package}

import "encoding/base64"

// {variable} is a byte representation for {fn}
var {variable}, _ = base64.StdEncoding.DecodeString("{base64str}")
'''


goosarchs = [
    ('darwin', '386'),
    ('darwin', 'amd64'),
    # # ('darwin', 'arm'),  // not compiling
    # # ('darwin', 'arm64'),  // not compiling
    # ('dragonfly', 'amd64'),
    ('freebsd', '386'),
    ('freebsd', 'amd64'),
    ('freebsd', 'arm'),
    ('linux', '386'),
    ('linux', 'amd64'),
    ('linux', 'arm'),
    ('linux', 'arm64'),
    # ('linux', 'ppc64'),
    # ('linux', 'ppc64le'),
    # ('linux', 'mips'),
    # ('linux', 'mipsle'),
    # ('linux', 'mips64'),
    # ('linux', 'mips64le'),
    # ('netbsd', '386'),
    # ('netbsd', 'amd64'),
    # ('netbsd', 'arm'),
    # ('openbsd', '386'),
    # ('openbsd', 'amd64'),
    # ('openbsd', 'arm'),
    # ('plan9', '386'),
    # ('plan9', 'amd64'),
    # # ('solaris', 'amd64'),  // not compiling
    ('windows', '386'),
    ('windows', 'amd64'),
]

binfiles = [
    ("./static/css/bootstrap.min.css", "FileBootstrapMinCSS"),
    ("./static/css/font-awesome.min.css", "FileFontAwesomeMinCSS"),
    ("./static/img/siridb-large.png", "FileSiriDBLargePNG"),
    ("./static/img/siridb-small.png", "FileSiriDBSmallPNG"),
    ("./static/img/loader.gif", "FileLoaderGIF"),
    ("./static/js/libs/jsleri-1.1.2.min.js", "FileLeriMinJS"),
    ("./static/js/grammar.js", "FileGrammarJS"),
    ("./static/fonts/FontAwesome.otf", "FileFontAwesomeOTF"),
    ("./static/fonts/fontawesome-webfont.eot", "FileFontawesomeWebfontEOT"),
    ("./static/fonts/fontawesome-webfont.svg", "FileFontawesomeWebfontSVG"),
    ("./static/fonts/fontawesome-webfont.ttf", "FileFontawesomeWebfontTTF"),
    ("./static/fonts/fontawesome-webfont.woff", "FileFontawesomeWebfontWOFF"),
    ("./static/fonts/fontawesome-webfont.woff2",
        "FileFontawesomeWebfontWOFF2"),
    ("./static/favicon.ico", "FileFaviconICO"),
    ("./src/index.html", "FileIndexHTML"),
    ("./src/waiting.html", "FileWaitingHTML"),
    ("./build/bundle.min.js", "FileBundleMinJS"),
    ("./build/layout.min.css", "FileLayoutMinCSS"),
]


GOFILE = 'siridb-http.go'
TARGET = 'siridb-http'


def get_version(path):
    version = None
    with open(os.path.join(path, GOFILE), 'r') as f:
        for line in f:
            if line.startswith('const AppVersion ='):
                version = line.split('"')[1]
    if version is None:
        raise Exception('Cannot find version in {}'.format(GOFILE))
    return version


def build_all():
    path = os.path.dirname(__file__)
    version = get_version(path)
    outpath = os.path.join(path, 'bin', version)
    if not os.path.exists(outpath):
        os.makedirs(outpath)

    for goos, goarch in goosarchs:
        tmp_env = os.environ.copy()
        tmp_env["GOOS"] = goos
        tmp_env["GOARCH"] = goarch
        outfile = os.path.join(outpath, '{}_{}_{}_{}.{}'.format(
            TARGET,
            version,
            goos,
            goarch,
            'exe' if goos == 'windows' else 'bin'))
        with subprocess.Popen(
                ['go', 'build', '-o', outfile],
                env=tmp_env,
                cwd=path,
                stdout=subprocess.PIPE) as proc:
            print('Building {}/{}...'.format(goos, goarch))


def build(development=True):
    path = os.path.dirname(__file__)
    version = get_version(path)
    outfile = os.path.join(path, '{}_{}.{}'.format(
        TARGET, version, 'exe' if sys.platform.startswith('win') else 'bin'))
    args = ['go', 'build', '-o', outfile]

    if development:
        args.extend(['--tags', 'debug'])

    with subprocess.Popen(
            args,
            cwd=path,
            stdout=subprocess.PIPE) as proc:
        print('Building {}...'.format(outfile))


def install_packages():
    path = os.path.dirname(__file__)
    with subprocess.Popen(
            ['npm', 'install'],
            cwd=os.path.join(path, 'src'),
            stdout=subprocess.PIPE) as proc:
        print(
            'Installing required npm packages and dependencies.\n'
            '(be patient, this can take some time)...')
    with subprocess.Popen(
            ['go', 'get', '-d'],
            cwd=path,
            stdout=subprocess.PIPE) as proc:
        print(
            'Downloading required go packages and dependencies.\n'
            '(be patient, this can take some time)...')


def webpack(development=True):
    print('(be patient, this can take some time)...')
    path = os.path.dirname(__file__)
    env = os.environ
    if not development:
        env['NODE_ENV'] = 'production'
    with subprocess.Popen([
            os.path.join('.', 'node_modules', '.bin', 'webpack'),
            '-d' if development else '-p'],
            env=env,
            cwd=os.path.join(path, 'src'),
            stdout=subprocess.PIPE) as proc:
        print(proc.stdout.read().decode('utf-8'))


def compile_less(development=True):
    path = os.path.dirname(__file__)
    if development:
        subprocess.run([
            'lessc',
            os.path.join(path, 'src', 'layout.less'),
            os.path.join(path, 'build', 'layout.css')])
    else:
        subprocess.run([
            'lessc',
            '--clean-css',
            os.path.join(path, 'src', 'layout.less'),
            os.path.join(path, 'build', 'layout.min.css')])


def compile(fn, variable, empty=False):
    if empty:
        data = b''
    else:
        with open(fn, 'rb') as f:
            data = f.read()
    with open('{}.go'.format(variable.lower()), 'w', encoding='utf-8') as f:
        f.write(template.format(
            package='main',
            fn=fn,
            variable=variable,
            base64str=base64.b64encode(data).decode('utf-8')
        ))

if __name__ == '__main__':

    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-i', '--install-packages',
        action='store_true',
        help='install required go and npm packages including dependencies')

    parser.add_argument(
        '-l', '--less',
        action='store_true',
        help='compile less (requires -d or -p)')

    parser.add_argument(
        '-w', '--webpack',
        action='store_true',
        help='compile webpack (requires -d or -p)')

    parser.add_argument(
        '-p', '--production-go',
        action='store_true',
        help='prepare go files for production')

    parser.add_argument(
        '-d', '--development-go',
        action='store_true',
        help='prepare placeholder go files for development')

    parser.add_argument(
        '-b', '--build',
        action='store_true',
        help='build binary (requires -d or -p)')

    parser.add_argument(
        '-a', '--build-all',
        action='store_true',
        help='build production binaries for all goos and goarchs')

    args = parser.parse_args()

    if args.production_go and args.development_go:
        print('Cannot use -d and -p at the same time')
        sys.exit(1)

    if args.build and not args.production_go and not args.development_go:
        print('Cannot use -b without -d or -p')
        sys.exit(1)

    if args.webpack and not args.production_go and not args.development_go:
        print('Cannot use -w without -d or -p')
        sys.exit(1)

    if args.less and not args.production_go and not args.development_go:
        print('Cannot use -l without -d or -p')
        sys.exit(1)

    if args.install_packages:
        install_packages()
        print('Finished installing required packages and dependencies!')

    if args.less:
        if args.production_go:
            print('Compiling production css...')
            compile_less(development=False)
        elif args.development_go:
            print('Compiling development css...')
            compile_less(development=True)
        else:
            sys.exit('-d or -p must be used')
        print('Finished compiling less!')

    if args.webpack:
        if args.production_go:
            print('Compiling production js using webpack...')
            webpack(development=False)
        elif args.development_go:
            print('Compiling development js using webpack...')
            webpack(development=True)
        else:
            sys.exit('-d or -p must be used')
        print('Finished compiling js using webpack...')

    if args.production_go:
        print('Create production go files...')
        for bf in binfiles:
            compile(*bf)
        print('Finished creating production go files!')

    if args.development_go:
        print('Create development go files...')
        for bf in binfiles:
            compile(*bf, empty=True)
        print('Finished creating development go files!')

    if args.build:
        if args.production_go:
            print('Build production binary')
            build(development=False)
        elif args.development_go:
            print('Build develpment binary')
            build(development=True)
        else:
            sys.exit('-d or -p must be used')
        print('Finished build!')

    if args.build_all:
        build_all()
        print('Finished building binaries!')

    if not any([
            args.install_packages,
            args.production_go,
            args.development_go,
            args.less,
            args.webpack,
            args.build,
            args.build_all]):
        parser.print_usage()
