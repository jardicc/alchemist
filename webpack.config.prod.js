const common = require("./webpack.config.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");


module.exports = {
	mode: "production",
	optimization: {
		moduleIds: "named",
		minimize: true,
		minimizer: [new TerserPlugin(
			{
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
						keep_classnames: true,
					},
				},
			},
		)],
	},
	...common,
	plugins: [
		...common.plugins,
		new ZipPlugin({
			// OPTIONAL: defaults to the Webpack output path (above)
			// can be relative (to Webpack output path) or absolute
			path: "../installer",
		
			// OPTIONAL: defaults to the Webpack output filename (above) or,
			// if not present, the basename of the path
			filename: "2bcdb900_PS",
		
			// OPTIONAL: defaults to "zip"
			// the file extension to use instead of "zip"
			extension: "ccx",
		
			// yazl Options		
			// OPTIONAL: see https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
			fileOptions: {
				mtime: new Date(),
				mode: 0o100664,
				compress: true,
				forceZip64Format: false,
			},
		
			// OPTIONAL: see https://github.com/thejoshwolfe/yazl#endoptions-finalsizecallback
			zipOptions: {
				forceZip64Format: false,
			},
		})
	]
};