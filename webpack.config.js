const path = require('path');
const webpack = require('webpack');

const ctx = path.join(__dirname);
const DEV = process.env.NODE_ENV === 'development';

const config = {
  entry: [
    `${ctx}/src/index.ts`
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
    filename: 'store.js'
  },
  resolve: {
    modules: [`${ctx}/app`, 'node_modules'],
    extensions: ['.js', '.ts']
  },
  module: {
    loaders: [{
      test: /\.ts?$/,
      loaders: [
        {
          loader: 'babel-loader',
          query: {
            presets: 'latest'
          }
        },
        'awesome-typescript-loader'
      ]
    }]
  },
  externals: {
    mobx: 'commonjs mobx'
  }
};

module.exports = config;