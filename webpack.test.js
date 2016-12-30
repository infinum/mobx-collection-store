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
  plugins: [],
  externals: {
    mobx: 'commonjs mobx',
    'mocha-typescript': 'commonjs mocha-typescript',
    chai: 'commonjs chai'
  },
  resolve: {
    modules: [`${ctx}/app`, 'node_modules'],
    extensions: ['.js', '.ts']
  },
  devtool: 'cheap-module-source-map',
  stats: false
};

module.exports = config;