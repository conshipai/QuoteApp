const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'https://quotes.gcc.conship.ai/',
  },
  resolve: {
    extensions: ['.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'quotes',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/QuotesModule'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true }
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
};
