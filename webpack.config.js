const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production';
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',  // Entry file
  output: {
    path: path.resolve(__dirname, 'dist'),  // Output folder
    filename: 'bundle.js',                   // Output file
    clean: true,                            // Clean dist before build
    publicPath: isProd ? '/expense-tracker/' : '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,                   // Transform .js and .jsx files
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,               // ← Add this block
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],           // Resolve these extensions
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',     // Base HTML file
      templateParameters: {
        PUBLIC_PATH: isProd ? '/expense-tracker/' : '/',
    },
    }),
    new webpack.DefinePlugin({
      'process.env.PUBLIC_URL': JSON.stringify(isProd ? '/expense-tracker' : ''),
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public/favicon.ico', to: '.' },
        { from: 'public/apple-icon.png', to: '.' },
      ],
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, 'public'),
    port: 3000,
    open: true,
    hot: true,
  },
  mode: isProd ? 'production' : 'development'
};
