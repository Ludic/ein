/*
 * ein test config
 */

import nodeExternals from 'webpack-node-externals';

export default {
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader"
      }
    ]
  }
};
