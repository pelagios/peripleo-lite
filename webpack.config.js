const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.jsx',
  output: {
    filename: 'peripleo.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'mapbox-gl': 'maplibre-gl'
    }
  },
  module: {
    rules: [
      { 
        test: /\.(js|jsx)$/, 
        use: { 
          loader: 'babel-loader' ,
          options: {
            "presets": [
              "@babel/preset-env",
              "@babel/preset-react"
            ],
            "plugins": [
              [
                "@babel/plugin-proposal-class-properties"
              ]
            ]
          }
        }
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    open: true,
    port: 3000,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'head',
      template: './public/index.html'
    }),
  ]
};