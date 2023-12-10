console.log("ESBuild config loaded");
import stylePlugin from "esbuild-style-plugin";
import {clean} from "esbuild-plugin-clean";
import {copy} from "esbuild-plugin-copy";
import {merge} from "webpack-merge";
import {build, context} from "esbuild";
import {zip} from "zip-a-folder";
import manifest from "./uxp/manifest.json" assert {type: "json"};
import chokidar from "chokidar";
import {typecheckPlugin} from "@jgoz/esbuild-plugin-typecheck";

const mode = process.argv[2];
//console.log(copy);
console.log(`Mode: ${mode}`);
let isProduction = false;

switch (mode) {
	case "--build":
		isProduction = true;
		break;
	case "--watch":
		break;
	default:
		console.error(`unknown mode: ${mode}`);
		process.exit(1);
}

/** @type {import("esbuild").CommonOptions} */
const esBuildConfigBase = {
	entryPoints: ["./src/shared/classes/Main.ts"],
	logLevel: "info",
	bundle: true,
	minify: false,

	sourcemap: "inline",
	platform: "browser",
	target: ["es2022", "node18"],
	external: ["photoshop", "uxp", "fs", "os"],
	outfile: "./dist/index.js",
	// adds less plugin
	plugins: [
		clean({
			patterns: "./dist",
		}),
		copy({
			assets: {
				from: "./uxp/**",
				to: "./",
			},
			watch: true,
		}),
		stylePlugin(),
		typecheckPlugin({
			watch: true,
		}),
	],
	footer: {
		// fixes sourcemap issue
		js: "//# sourceURL=webpack-internal:///./src/",
	},
	// Disable some features/minification to make it work in UXP
	supported: {
		// JavaScript
		"top-level-await": false,
		// CSS... because UXP is special
		"hex-rgba": false,
		"inline-style": false,
		"inset-property": false,
		"is-pseudo-class": false,
		"modern-rgb-hsl": false,
		"nesting": false,
		"rebecca-purple": false,
	},
};

/** @type {import("esbuild").CommonOptions} */
const esBuildConfigProduction = {
	minify: true,
	keepNames: true,
	sourcemap: false,
	footer: {js: ""},
	legalComments: "inline",
};

const config = merge(
	esBuildConfigBase,
	isProduction && esBuildConfigProduction,
);

(async () => {
	try {
		const start = Date.now();

		if (isProduction) {
			// build plugin
			await build(config);

			// pack plugin into installer
			await zip("./dist", `./installer/${manifest.name}_${manifest.id}_v${manifest.version.replace(/\./gm, "-")}.ccx`);
		} else {
			// prepare watcher
			let ctx = await context(config);
			// add some extra files to watch for
			chokidar.watch("./uxp/**",
				{
					// only after change happened
					ignoreInitial: true,
					// polling to group changes
					usePolling: true,
					interval: 500,
				},
			).on("all", async (event, path) => {
				console.log(event, path);
				// cancel already running build
				await ctx.cancel();
				// dispose old context
				await ctx.dispose();
				// create new context
				ctx = await context(config);
				// start watching again
				await ctx.watch();
			});
			// start watching
			await ctx.watch();
		}

		console.log("ESBuild finished: " + (Date.now() - start) + "ms");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();




