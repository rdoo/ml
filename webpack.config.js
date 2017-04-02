const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        bundle: './index.ts',
        worker: './ml.ts'
    },
    output: {
        path: path.join(__dirname, 'build'),
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
            { from: path.join(__dirname, 'src', 'index.html') },
            { from: path.join(__dirname, 'src', 'd3.min.js') }
        ])
    ]
};