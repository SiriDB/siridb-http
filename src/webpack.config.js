/* global require, __dirname, process, module */
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, '../build');
const APP_DIR = path.resolve(__dirname, '');

var config = {
    cache: true,
    entry: APP_DIR + '/Components/index.jsx',
    output: {
        path: BUILD_DIR,
        filename: process.env.NODE_ENV === 'production' ? 'bundle.min.js' : 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader',
                exclude: /node_modules\/(?!vlow)/
            }
        ]
    },
    resolve: {
        alias: {
            'vlow': path.resolve(__dirname, './node_modules/vlow/index.js')
        }
    },
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                uglifyOptions: {
                    compress: {
                        warnings: false
                    }
                }
            })
        ]
    }
};

module.exports = config;