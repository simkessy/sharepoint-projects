var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './app/loader.js',
  output: {
    filename: './bundle.js'
  },
  devtool: 'source-map',
  module: {
   preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [ "babel-loader", "eslint-loader" ]

      }
   ],
    loaders: [{
      test: /\.js?$/,
      loader: 'babel-loader?cacheDirectory',
      exclude: /(node_modules|bower_components|lib)/
    }, {
      test: /\.jsx?$/,
      loader: 'babel-loader?cacheDirectory',
      exclude: /(node_modules|bower_components|lib)/
    }, {
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }, {
      test: /\.scss?$/,
      loaders: ['style', 'css', 'sass']
    },
    {
      test: /\.less$/,
      loader: "style!css!less"
    },
    {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loader: 'url?limit=10000!img?progressive=true'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file-loader?name=SPSlider/font-[sha512:hash:base64:7].[ext]?mimetype=image/svg+xml'
    }, {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file-loader?name=SPSlider/font-[sha512:hash:base64:7].[ext]?mimetype=application/font-woff"
    }, {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file-loader?name=SPSlider/font-[sha512:hash:base64:7].[ext]?mimetype=application/font-woff"
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file-loader?name=SPSlider/font-[sha512:hash:base64:7].[ext]?mimetype=application/octet-stream"
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file-loader?name=SPSlider/font-[sha512:hash:base64:7].[ext]"
    }, {
      test: [/\.js$/, /\.es6$/],
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015']
      }
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
  ],
  resolve: {
   extensions: ['', '.js', '.es6']
 }
};
