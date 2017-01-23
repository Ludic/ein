/*
 * ein test config
 */

var path = require('path');
var fs = require('fs');

module.exports = {
  entry: "./test/main.js",
  target: 'node',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader"
      }
    ]
  }
};
