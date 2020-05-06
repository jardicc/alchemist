const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'development', // Make this custom
  entry: './src/index.tsx',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js'],
  },
  externals: {
    'photoshop': 'commonjs2 photoshop', 
    'uxp': 'commonjs2 uxp'
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: 'tslint-loader',
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin(['uxp'], {
      copyUnmodified: true,
    }), // Copy everything in UXP to dist
  ],
}
