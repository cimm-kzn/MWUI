const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: {
    search: [
      'babel-polyfill',
      './src/search/index.js'
    ],
    predictor: [
      'babel-polyfill',
      './src/predictor/index.js'
    ],
    dbform: [
      'babel-polyfill',
      './src/dbform/index.js'
    ],
    auth: [
      'babel-polyfill',
      './src/auth/index.js'
    ]
  },
  output: {
    path: path.join(__dirname, "../MWUI/static/js"),
    filename: '[name].bundle.js',
    publicPath : 'public/dist'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../css/[name].css",
      chunkFilename: "[id].css"
    }),
  ]
};