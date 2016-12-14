#!/usr/bin/python
import os
import slimit
import csscompressor
import argparse

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
STATIC_DIR = os.path.join(CURRENT_DIR, 'static')

def min_js():
    #################################################
    # Minify app js
    #################################################

    content = []

    for name in ('app.js',
                 'grammar.js',
                 'router.js'):
        with open(os.path.join(STATIC_DIR, 'js', name), 'r') as f:
            content.append(f.read())

    with open(os.path.join(STATIC_DIR, 'js', 'app.min.js'), 'w') as f:
        f.write(slimit.minify(''.join(content), mangle=True, mangle_toplevel=True))


def min_css():
    #################################################
    # Minify css
    #################################################

    with open(os.path.join(STATIC_DIR, 'css', 'style.css'), 'r') as f:
        content = f.read()

    with open(os.path.join(STATIC_DIR, 'css', 'style.min.css'), 'w') as f:
        f.write(csscompressor.compress(content))


if __name__ == '__main__':
    min_js()
    min_css()