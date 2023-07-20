/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const WatchExternalFilesPlugin = require('webpack-watch-external-files-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = (env) => {
  const isProduction = env.mode === 'prod'

  console.log(isProduction ? 'PRODUCTION BUILD' : 'DEVELOPMENT BUILD')
  console.log(env)

  const config = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? undefined : 'eval-source-map',
    entry: './src/shared/classes/Main.ts',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: ['.ts', '.tsx', '.js'],
      fallback: {
        os: false,
        fs: false
      }
    },
    externals: {
      photoshop: 'commonjs2 photoshop',
      uxp: 'commonjs2 uxp',
      fs: 'commonjs2 fs'
    },
    performance: {
      maxEntrypointSize: Infinity,
      maxAssetSize: Infinity
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: 'ts-loader'
        },
        {
          test: /\.less$/,
          exclude: /node_modules/,
          use: ['style-loader', 'css-loader', 'less-loader']
        }
      ]
    },
    plugins: [
      new ESLintPlugin({ files: ['src/**/*.ts', 'src/**/*.tsx'] }),
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [{ from: 'uxp', to: './' }]
      }),
      // this will copy manifest files and icon files on change
      // without need to explicitly trigger watcher or restart it
      new WatchExternalFilesPlugin({
        files: ['/uxp/**']
      })
    ]
  }

  // Additional steps for production build
  if (isProduction) {
    // Make code smaller but keep it somehow readable since it is open-source.
    // So it will be easier to debug production builds.
    config.optimization = {
      moduleIds: 'named',
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: true,
          parallel: true,
          terserOptions: {
            mangle: false,
            compress: {
              conditionals: false,
              drop_console: true,
              drop_debugger: true,
              comparisons: false,
              collapse_vars: false,
              booleans: false,
              inline: false,
              keep_classnames: true
            }
          }
        })
      ]
    }

    // Pack plugin into CCX automatically
    config.plugins.push(
      new ZipPlugin({
        // OPTIONAL: defaults to the Webpack output path (above)
        // can be relative (to Webpack output path) or absolute
        path: '../installer',

        // OPTIONAL: defaults to the Webpack output filename (above) or,
        // if not present, the basename of the path
        filename: '2bcdb900_PS',

        // OPTIONAL: defaults to "zip"
        // the file extension to use instead of "zip"
        extension: 'ccx'
      })
    )
  }

  return config
}
