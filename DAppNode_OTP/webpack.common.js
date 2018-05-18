var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var extractPlugin = new ExtractTextPlugin({
   filename: 'main.css'
});
// This is a js file, import first then export.

// This is a javascript object, know the syntax (comas, arrays, etc)
module.exports = {
  // Where webpack starts analyzing the project (relative path from the config)
  // You can have multiple entry points
  entry: './src/js/app.js',
  output: {
    // The path module helps you write absolute paths easier
    path: path.resolve(__dirname, '../docs'),
    filename: 'bundle.js',
  },
  // resolve module
  resolve: {
    alias: {
      EventBusAlias$: path.resolve(__dirname, 'src', 'js', 'components', 'event-bus.js'),
      Store$: path.resolve(__dirname, 'src', 'js', 'stores', 'AppStore.js'),
      Action$: path.resolve(__dirname, 'src', 'js', 'actions', 'AppActions.js'),
      Params$: path.resolve(__dirname, 'src', 'js', 'params.js'),
      Lib: path.resolve(__dirname, 'src', 'js', 'lib'),
      Audio: path.resolve(__dirname, 'src', 'audio'),
      Img: path.resolve(__dirname, 'src', 'img'),
    },
  },
  // Modules are applied to single files before bundling
  module: {
    rules: [
      {
        test: /\.css$/,
        use: extractPlugin.extract({
          use: ['css-loader']
        })
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      {
        // Use this loader for both jpg and png
        test: /\.(jpg|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              // Dont't let file-loader use hashes (Personal opinion)
              name: '[name].[ext]',
              // Store the images in a separate folder (Personal opinion)
              outputPath: 'img/',
              // Put img/imageName in the html reference in the index.html
              publicPath: ''
            }
          }
        ]
      },
      {
        test: /\.txt$/,
        use: 'raw-loader'
      }
    ]
  },
  // Plugins are applied to the bundled code before exporting
  // f.e. a minifier (but webpack already does that)
  plugins: [

    new webpack.ProvidePlugin({
    }),
    // Always instiate (new) plugins and import them
    // You can do both at the beggining and then reference the var
    extractPlugin,
    new HtmlWebpackPlugin({
      template: 'src/template.html'
    }),
    // This will clean the dist folder before building, so all files are fresh and new
    new CleanWebpackPlugin(['dist'])
  ]
}
