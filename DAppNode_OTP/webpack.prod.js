const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')


module.exports = merge(common, {
  plugins: [
    new UglifyJSPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
    new FaviconsWebpackPlugin({
      logo: './src/dappnodeicon.png',
      inject: true,
      prefix: 'icons/',
    }),
  ]
});
