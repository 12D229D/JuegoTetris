const path = require('path');
module.exports = {
  entry: './main.js',
  target: 'electron-main',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  resolve: { extensions: ['.js', '.ts', '.tsx'] },
  module: {
    rules: [
      { test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/ }
    ]
  }
};