const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');

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
        exclude: [/node_modules/],
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
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  experiments: {
    asyncWebAssembly: true
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    open: true,
    port: 3000,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'head',
      template: './public/index.html'
    }),
    new BrotliPlugin({
			asset: '[path].br[query]',
			test: /\.(json|xml)$/,
			threshold: 10240,
			minRatio: 0.8
		})
  ]
};