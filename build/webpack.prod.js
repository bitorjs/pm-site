const WebpackMerge = require('webpack-merge');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const base = require('./webpack.base');

const cwd = process.cwd();

// the path(s) that should be cleaned
let pathsToClean = [
  'dist'
]

// the clean options to use
let cleanOptions = {
  root: cwd,
  exclude: ['shared.js'],
  verbose: true,
  dry: false
}


module.exports = WebpackMerge(base, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(cleanOptions),
    new WebpackShellPlugin({
      onBuildEnd: [
        `npm run server`
      ]
    })
  ]
});