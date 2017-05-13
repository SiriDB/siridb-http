#!/usr/bin/python3
import argparse
import os
import subprocess

template = '''// +build !debug

package {package}

// {variable} is a byte representation for {fn}
var {variable} = []byte{{{bytes}}}
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


def build_all():
    version = None
    with open('admin.go', 'r') as f:
        for line in f:
            if line.startswith('const AppVersion ='):
                version = line.split('"')[1]
    if version is None:
        raise Exception('Cannot find version in siridb-http.go')

    outpath = os.path.join('bin', version)
    if not os.path.exists(outpath):
        os.makedirs(outpath)

    for goos, goarch in goosarchs:
        tmp_env = os.environ.copy()
        tmp_env["GOOS"] = goos
        tmp_env["GOARCH"] = goarch
        outfile = os.path.join(outpath, 'siridb-admin_{}_{}_{}.{}'.format(
            version, goos, goarch, 'exe' if goos == 'windows' else 'bin'))
        with subprocess.Popen(
                ['go', 'build', '-o', outfile],
                env=tmp_env,
                stdout=subprocess.PIPE) as proc:
            print('Building {}/{}...'.format(goos, goarch))


def compile_less():
    path = os.path.dirname(__file__)
    subprocess.run([
        'lessc',
        '--clean-css',
        os.path.join(path, 'src', 'layout.less'),
        os.path.join(path, 'build', 'layout.min.css')])

    subprocess.run([
        'lessc',
        os.path.join(path, 'src', 'layout.less'),
        os.path.join(path, 'build', 'layout.css')])


def compile(fn, variable, empty=False):
    if empty:
        data = ''
    else:
        with open(fn, 'rb') as f:
            data = f.read()
    with open('{}.go'.format(variable.lower()), 'w', encoding='utf-8') as f:
        f.write(template.format(
            package='main',
            fn=fn,
            variable=variable,
            bytes=', '.join(str(c) for c in data)
        ))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-l', '--less',
        action='store_true',
        help='compile less')

    parser.add_argument(
        '-g', '--go',
        action='store_true',
        help='compile go')

    parser.add_argument(
        '-e', '--go-empty',
        action='store_true',
        help='compile empty go files')

    parser.add_argument(
        '-a', '--build-all',
        action='store_true',
        help='build for all goos and goarchs')

    args = parser.parse_args()

    if args.less:
        print('Compile less...')
        compile_less()
        print('Finished!')
    elif args.go:
        print('Compile go...')
        for bf in binfiles:
            compile(*bf)
        print('Finished!')
    elif args.go_empty:
        print('Compiled empty go files...')
        for bf in binfiles:
            compile(*bf, empty=True)
        print('Finished!')
    elif args.build_all:
        build_all()
        print('Finished!')
    else:
        parser.print_usage()
