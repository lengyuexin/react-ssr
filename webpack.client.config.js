const path = require('path')
const webpackMerge = require('webpack-merge')
const baseConf = require('./webpack.base.config')

const clientConf = {
    mode: 'development',
    entry: './src/client/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './public')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', {
                    loader: 'css-loader',
                    options: {
                        modules: true
                    }
                }]
            },
        ]
    }

}

module.exports = webpackMerge(baseConf, clientConf)