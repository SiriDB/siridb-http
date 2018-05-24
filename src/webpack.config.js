/* global require, __dirname, process, module */

const webpack = require('webpack');
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
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            // A common mistake is not stringifying the "production" string.
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
    ],
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
    },
    performance: {
        hints: false
    }
};

module.exports = config;