var webpack = require('webpack');
var path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../static/js');
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
                query: {
                    cacheDirectory: true
                }
            }
        ]
    },
    externals: {
        'Config': JSON.stringify({
            serverUrl: "/api",
            domain: "/"
        })
    },
    plugins: [
        new webpack.DefinePlugin({
            // A common mistake is not stringifying the "production" string.
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
    ]
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true
            }
        })
    );
}

module.exports = config;