const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const nodeModules = { };
fs.readdirSync('node_modules').filter(x => x !== '.bin').forEach(x => nodeModules[x] = 'commonjs ' + x);

module.exports = [
    {
        target: 'node',
        entry: path.join(__dirname, 'src', 'ml', 'ml.ts'),
        output: {
            path: path.join(__dirname, 'build'),
            filename: 'ml.js'
        },
        resolve: {
            extensions: ['.js', '.ts']
        },
        module: {
            loaders: [
                { test: /\.ts$/, loaders: ['awesome-typescript-loader'] }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({ IS_HEROKU: false }),
            new UglifyJSPlugin()
        ]
    },
    {
        entry: path.join(__dirname, 'src', 'client', 'index.tsx'),
        output: {
            path: path.join(__dirname, 'build', 'client'),
            filename: 'bundle.js'
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx']
        },
        module: {
            loaders: [
                { test: /\.tsx?$/, loaders: ['awesome-typescript-loader'] },
                { test: /\.css$/, loaders: ['style-loader', 'css-loader'] }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: path.join(__dirname, 'src', 'client', 'index.html') }
            ]),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            }),
            new UglifyJSPlugin()
        ]
    },
    {
        target: 'node',
        externals: nodeModules,
        node: {
            __filename: false,
            __dirname: false
        },
        entry: path.join(__dirname, 'src', 'server', 'index.ts'),
        output: {
            path: path.join(__dirname, 'build'),
            filename: 'server.js'
        },
        resolve: {
            extensions: ['.js', '.ts']
        },
        module: {
            loaders: [
                { test: /\.ts$/, loaders: ['awesome-typescript-loader'] }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: path.join(__dirname, 'src', 'data', 'PZU'), to: 'data' }
            ]),
            new webpack.DefinePlugin({ IS_HEROKU: false }),
            new UglifyJSPlugin()
        ]
    }
];