/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const common = require("./webpack.config.common.js");
const TerserPlugin = require("terser-webpack-plugin");


module.exports = {
	mode: "production",
	optimization: {
		moduleIds:"named",
		minimize: true,
		minimizer: [new TerserPlugin(
			{
				extractComments: true,
				parallel: true,
				terserOptions: {
					mangle: false,
					compress: {
						conditionals :false,
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
};