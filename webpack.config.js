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
      react: { 
        singleton: true,
        requiredVersion: '^18.0.0'  // Add this
      },
      'react-dom': { 
        singleton: true,
        requiredVersion: '^18.0.0'  // Add this
      },
      'react-router-dom': { 
        singleton: true,
        requiredVersion: '^6.0.0'   // Add this
      }
    }
  }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
};
