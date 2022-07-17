const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = (env) => {
	
	const isProduction = env.mode === "prod";

	console.log(isProduction ? "PRODUCTION BUILD" : "DEVELOPMENT BUILD");
	console.log(env);

	const config = {
		mode: isProduction ? "production" : "development",
		devtool: isProduction ? undefined : "eval-source-map",
		entry: "./src/shared/classes/Main.ts",
		output: {
			filename: "index.js",
			path: path.resolve(__dirname, "dist"),
		},
		resolve: {
			// Add '.ts' and '.tsx' as resolvable extensions.
			extensions: [".ts", ".tsx", ".js"],
			fallback: {
				"os": false,
			},
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
					use: ["style-loader", "css-loader", "less-loader"],
				},
			],
		},
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin({
				patterns: [
					{ from: "uxp", to: "./" },
				],
			}),
		],
	}

	// Additional steps for production build
	if (isProduction) {
		// Make code smaller but keep it somehow readable since it is open-source.
		// So it will be easier to debug production builds.
		config.optimization = {
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
		};

		// Pack plugin into CCX automatically
		config.plugins.push(
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
		)
	}

	return config;
};