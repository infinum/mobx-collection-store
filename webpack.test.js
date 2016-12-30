const path = require('path');

const ctx = path.join(__dirname);

const config = {
  entry: path.join(__dirname, 'tests/main.test.ts'),
  output: {
    filename: 'test.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    loaders: [{
      test: /\.ts?$/,
      loaders: [
        'babel-loader',
        'awesome-typescript-loader'
      ]
    }]
  },
  plugins: [],
  externals: {
    mobx: 'commonjs mobx',
    'mocha-typescript': 'commonjs mocha-typescript',
    chai: 'commonjs chai'
  },
  resolve: {
    modules: [`${ctx}/app`, 'node_modules'],
    extensions: ['.ts']
  },
  devtool: 'cheap-module-source-map'
};

module.exports = config;