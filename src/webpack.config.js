/* global require, __dirname, process, module */
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const BUILD_DIR = path.resolve(__dirname, '../build');
const APP_DIR = path.resolve(__dirname, '');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var config = {
    entry: APP_DIR + '/Components/index.js',
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
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new BundleAnalyzerPlugin({
            /* Usage:
                *      NODE_ENV='analyze' ./node_modules/.bin/webpack -p
                *      or
                *      npm run analyze
                */
            'analyzerMode': process.env.NODE_ENV === 'analyze' ? 'static' : 'disabled'
        })
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 5,
                },
            }),
        ]
    },
    performance: {
        maxEntrypointSize: 500000,
        maxAssetSize: 500000
    }
};

module.exports = config;