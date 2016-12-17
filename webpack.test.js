const path = require('path');

const config = {
  entry: path.join(__dirname, 'tests/main.test.ts'),
  output: {
    filename: 'test.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    loaders: [{
      test: /\.ts?$/,
      loaders: ['awesome-typescript-loader']
    }]
  },
  plugins: [],
  externals: {
    mobx: 'commonjs mobx',
    mocha: 'commonjs mocha',
    chai: 'commonjs chai'
  },
  devtool: 'cheap-module-source-map'
};

module.exports = config;