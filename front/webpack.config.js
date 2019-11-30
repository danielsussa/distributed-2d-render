const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'url-loader',
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ],
  },
  plugins: [
    new CopyPlugin([
      { from: 'index.html', to: 'index.html', toType: 'file'},
    ]),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};