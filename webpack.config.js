const path = require('path');
const webpack = require('webpack');

const ctx = path.join(__dirname);
const DEV = process.env.NODE_ENV === 'development';

const config = {
  entry: [
    `${ctx}/src/main.ts`
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': DEV ? JSON.stringify('production') : null
      }
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
      loaders: ['awesome-typescript-loader']
    }]
  }
};

if (!DEV) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
}

module.exports = config;