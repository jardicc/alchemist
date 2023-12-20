/* eslint-disable require-await */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-constant-condition */
console.log("ESBuild config loaded");
import http from "http";
import {lessLoader} from "esbuild-plugin-less";
import {clean} from "esbuild-plugin-clean";
import {copy} from "esbuild-plugin-copy";
import {merge} from "webpack-merge";
import {build, context} from "esbuild";
import {zip} from "zip-a-folder";
import manifest from "./uxp/manifest.json" with {type: "json"};
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

// store request to send reload signal later
let reloadResult;

/** @type {import("esbuild").Plugin} */
let reloadPlugin = {
	name: "reloadPlugin",
	setup(build) {
		// eslint-disable-next-line require-await
		build.onEnd(async result => {
			if (!reloadResult) {
				console.log("Nothing to reload.");
				return;
			}
			console.log("Sending reload signal...");
			reloadResult.statusCode = 200;
			reloadResult.setHeader("Content-Type", "text/plain");
			reloadResult.end("Reload now!");
		});
	},
};

// reload code injection
const reloadCode = `
(async () => {
	async function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	while (true) {
		try {
			await fetch("http://127.0.0.1:3033");
			location.reload();			
		}catch(err) {
			console.log(err);
			await sleep(500);
		}
	}
})();
`;

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
			cleanOn: "start",
		}),
		copy({
			assets: {
				from: "./uxp/**",
				to: "./",
			},
			watch: true,
			copyOnStart: true,
		}),
		lessLoader(),
		typecheckPlugin({
			watch: true,
		}),
	],
	footer: {
		// fixes sourcemap issue
		js: reloadCode + "\n//# sourceURL=webpack-internal:///./src/",
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

if (!isProduction) {
	config.plugins.push(reloadPlugin);
}


(async () => {
	try {
		const start = Date.now();

		if (isProduction) {
			// build plugin
			await build(config);

			// pack plugin into installer
			await zip("./dist", `./installer/${manifest.name}_${manifest.id}_v${manifest.version.replace(/\./gm, "-")}.ccx`);
		} else {
			const hostname = "127.0.0.1";
			const port = 3033;

			const server = http.createServer((req, res) => {
				console.log("Waiting for reload signal...");
				reloadResult = res;
			});

			server.setTimeout(0);
			server.timeout = 0;
			server.keepAliveTimeout = 0;
			server.requestTimeout = 0;
			server.headersTimeout = 0;

			server.listen(port, hostname, () => {
				console.log(`Reload server running at http://${hostname}:${port}/`);
			});

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


