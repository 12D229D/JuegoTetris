const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './src/index.tsx',
  target: 'electron-renderer',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
  },
  resolve: { extensions: ['.js', '.ts', '.tsx'] },
  module: {
    rules: [
      { test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/ }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    })
  ]
};