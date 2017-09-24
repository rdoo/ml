const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const nodeModules = { };
fs.readdirSync('node_modules').filter(x => x !== '.bin').forEach(x => nodeModules[x] = 'commonjs ' + x);

module.exports = [
    {
        context: path.join(__dirname, 'src'),
        entry: {
            bundle: './client/index.ts',
            worker: './ml.ts',
        },
        output: {
            path: path.join(__dirname, 'build', 'client'),
            filename: '[name].js',
            libraryTarget: 'var',
            library: 'ml'
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
                { from: path.join(__dirname, 'src', 'client', 'index.html') },
                { from: path.join(__dirname, 'src', 'visuals', 'd3.min.js') }
            ]),
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
        context: path.join(__dirname, 'src'),
        entry: {
            server: './server/index.ts',
            generator: './data/generator.ts'
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
    }
];