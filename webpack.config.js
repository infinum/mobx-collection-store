const path = require('path');
const webpack = require('webpack');

const ctx = path.join(__dirname);
const DEV = process.env.NODE_ENV === 'development';

const config = {
  entry: [
    `${ctx}/dist/index.js`
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': DEV ? JSON.stringify('production') : null
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      acorn: true,
      'screw-ie8': true,
      compress: {
        warnings: false,
        drop_console: true // eslint-disable-line camelcase
      },
      comments: false
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  ],
  output: {
    path: `${ctx}/dist`,
    filename: 'store.js',
    library: 'mobx-collection-store',
    libraryTarget: 'commonjs'
  },
  resolve: {
    modules: [`${ctx}/app`, 'node_modules'],
    extensions: ['.js']
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      loaders: [
        'babel-loader'
      ]
    }]
  },
  externals: {
    mobx: 'commonjs mobx'
  }
};

module.exports = config;