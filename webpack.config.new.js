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
        context: path.join(__dirname, 'src'),
        entry: {
            worker: './ml.ts',
        },
        output: {
            path: path.join(__dirname, 'build'),
            filename: '[name].js'
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
            // new UglifyJSPlugin()
        ]
    },
    {
        context: path.join(__dirname, 'src'),
        entry: {
            bundle: './client/index.tsx'
        },
        output: {
            path: path.join(__dirname, 'build', 'client'),
            filename: '[name].js'
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
            // new UglifyJSPlugin()
        ]
    },
    {
        target: 'node',
        externals: nodeModules,
        node: {
            __filename: false,
            __dirname: false
        },
        context: path.join(__dirname, 'src'),
        entry: {
            server: './server/index.ts'
        },
        output: {
            path: path.join(__dirname, 'build'),
            filename: '[name].js'
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
                { from: path.join(__dirname, 'src', 'data', 'data.txt') }
            ]),
            // new UglifyJSPlugin()
        ]
    }
];