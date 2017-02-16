#!/usr/bin/python3
import os
import subprocess


if __name__ == '__main__':
    path = os.path.dirname(__file__)

    print('Compile less...')
    subprocess.run([
        'lessc',
        '--clean-css',
        os.path.join(path, 'static', 'css', 'layout.less'),
        os.path.join(path, 'static', 'css', 'layout.min.css')])

    print('Webpack (be patient, this can take some time)...')
    env = os.environ
    env['NODE_ENV'] = 'production'
    with subprocess.Popen([
            os.path.join('.', 'node_modules', '.bin', 'webpack'),
            '-p'],
            env=env,
            cwd=os.path.join(path, 'src'),
            stdout=subprocess.PIPE) as proc:
        print(proc.stdout.read().decode('utf-8'))
