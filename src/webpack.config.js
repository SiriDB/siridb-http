/* global require, __dirname, process, module */
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, '../build');
const APP_DIR = path.resolve(__dirname, '');

var config = {
    entry: APP_DIR + '/Components/index.js',
    output: {
        path: BUILD_DIR,
        filename: process.env.NODE_ENV === 'production' ? 'bundle.min.js' : 'bundle.js',
    },
    module: {
        rules: [{
            test: /\.jsx?/,
            include: APP_DIR,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            use: 'css-loader/locals'
        }]
    },
    plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
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
    }
};

module.exports = config;