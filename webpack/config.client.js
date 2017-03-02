const { resolve } = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const env = process.env.NODE_ENV || 'development'
const isDev = env !== 'production'

function getEntry() {
	const entry = []
	if (isDev) {
		entry.push(
			'react-hot-loader/patch',
			'webpack/hot/dev-server',
			'webpack-hot-middleware/client'
		)
	}
	entry.push('./client/index.js')
	return entry
}

function getPlugins() {
	const plugins = [
		new ExtractTextPlugin({
			filename: '[name].css',
			disable: isDev
		}),
		new webpack.EnvironmentPlugin({
			NODE_ENV: JSON.stringify(env)
		}),
		new webpack.DefinePlugin({
			__CLIENT__: true,
			__SERVER__: false,
			__DEV__: isDev
		})
	]
	if (isDev) {
		plugins.push(
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NamedModulesPlugin()
		)
	} else {
		plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				sourceMap: true,
				beautify: false,
				mangle: { screw_ie8: true },
				compress: {
					screw_ie8: true,  // React doesn't support IE8
					warnings: false,
					unused: true,
					dead_code: true,
				},
				output: {
					screw_ie8: true,
					comments: false
				},
			})
		)
	}

	return plugins
}

function getBabelOptions() {
	const plugins = [
		'transform-object-rest-spread'
	]
	const presets = [
		[ 'latest', { modules: false } ],
		'react'
	]
	if (isDev) {
		plugins.push(
			'react-hot-loader/babel'
		)
	}
	return {
		cacheDirectory: isDev,
		babelrc: false,
		presets,
		plugins
	}
}

module.exports = {
	name: 'client',
	target: 'web',
	cache: isDev,
	entry: getEntry(),
	context: resolve(process.cwd(), 'src'),
	output: {
		filename: 'bundle.js',
		path: resolve(process.cwd(), 'build/public'),
		publicPath: '/'
	},
	devtool: isDev ? 'eval' : 'source-map',
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: getBabelOptions()
					},
					'eslint-loader']
			},
			{
				test: /\.styl$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true,
								modules: true,
								importLoaders: 1,
								localIdentName: '[local]_[name]',
								minimize: !isDev,
							}
						},
						'stylus-loader'
					]
				})
			}
		]
	},
	plugins: getPlugins()
}