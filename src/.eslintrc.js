module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': ['eslint:recommended', 'plugin:react/all'],
    'parserOptions': {
        'ecmaFeatures': {
            'experimentalObjectRestSpread': true,
            'jsx': true
        },
        'sourceType': 'module'
    },
    'parser': 'babel-eslint',
    'plugins': [
        'react'
    ],
    'settings': {
        'react': {
            'version': '16.8.1'
        }
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'react/display-name': [0],
        'react/forbid-prop-types': [0],
        'react/function-component-definition': [0],
        'react/jsx-curly-brace-presence': [0],
        'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }],
        'react/jsx-max-depth': [2, { 'max': 7 }],
        'react/jsx-newline': [0],
        'react/no-array-index-key': [0],
        'react/no-multi-comp': [2, { 'ignoreStateless': true }],
        'react/no-set-state': [0],
        'react/no-unstable-nested-components': [0],
        'react/sort-prop-types': [0]

    }
};
