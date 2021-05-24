/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
	entry: "./src/shared/classes/Main.ts",
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, "dist"),
	},
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js"],
	},
	externals: {
		"photoshop": "commonjs2 photoshop",
		"uxp": "commonjs2 uxp",
	},
	performance: {
		maxEntrypointSize: Infinity,
		maxAssetSize: Infinity,
	},
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: "ts-loader",
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.less$/,
				use: [
					{
						loader: "style-loader",
					},
					{
						loader: "css-loader",
					},
					{
						loader: "less-loader",
					},
				],
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyPlugin(["uxp"], {
			copyUnmodified: true,
		}), // Copy everything in UXP to dist
	],
};