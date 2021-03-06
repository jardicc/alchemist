/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const common = require("./webpack.config.common.js");
const TerserPlugin = require("terser-webpack-plugin");


module.exports = {
	mode: "production",
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin(
			{
				extractComments: true,
				parallel: true,
				terserOptions: {
					compress: {
						drop_console: true,
					},
				},
			},
		)],
	},
	...common,
};