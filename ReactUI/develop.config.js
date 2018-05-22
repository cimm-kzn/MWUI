const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    search: [
      'babel-polyfill',
      './src/search/index.js',
      'webpack/hot/only-dev-server'
    ],
    predictor: [
      'babel-polyfill',
      './src/predictor/index.js',
      'webpack/hot/only-dev-server'
    ],
    dbform: [
      'babel-polyfill',
      './src/dbform/index.js',
      'webpack/hot/only-dev-server'
    ],
    auth: [
      'babel-polyfill',
      './src/auth/index.js',
      'webpack/hot/only-dev-server'
    ]
  },
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css/,
        use:  [  'style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  watchOptions: {
    poll: true
  },
  devServer:{
    hot: true,
    open: true,
    contentBase: './public/',
    port: 3000,
    proxy: {
      "/api/**": { target: "https://cimm.kpfu.ru:443/" ,  secure: false }
    }
  }
};