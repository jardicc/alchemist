console.log("ESBuild config loaded");
import http from "http";
import {lessLoader} from "esbuild-plugin-less";
import {clean} from "esbuild-plugin-clean";
import {merge} from "webpack-merge";
import {build, context} from "esbuild";
import {zip} from "zip-a-folder";
import manifest from "./build/manifest.json" with {type: "json"};
import {typecheckPlugin} from "@jgoz/esbuild-plugin-typecheck";

// store request to send reload signal later
let serverRes, server;
const port = 3033;

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

/** @type {import("esbuild").Plugin} */
let reloadPlugin = {
	name: "reloadPlugin",
	setup(build) {
		build.onEnd(async result => {
			console.log("\n⟳ Done... Reload plugin in PS");

			if (!serverRes) {
				console.log("Nothing to reload.");
				return;
			}

			serverRes?.end("done");
			server.closeAllConnections();
		});
	},
};

// reload code injection
const reloadCode = `
	/* this will reload the plugin in PS when webpack detects changes*/
	void (async function () {
		async function sleep(ms) {
			return new Promise(resolve => {window.setTimeout(resolve, ms);});
		}
		while (true) {
			try {
				await fetch("http://localhost:3033/");
				console.log("⟳ Got webpack reload request");
				location.reload();
			} catch (e) {
				console.info("⟳ Waiting for webpack start in watch mode...");
				await sleep(1000);
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
	outfile: "./build/bundle/index.js",
	// adds less plugin
	plugins: [
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
	plugins: [
		clean({
			patterns: "./build/bundle",
			cleanOn: "start",
		}),
		lessLoader(),
		typecheckPlugin(),
	],
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
			await zip("./build", `./installer/${manifest.name}_${manifest.id}_v${manifest.version.replace(/\./gm, "-")}.ccx`);
		} else {
			console.log("⟳ Plugin reloader initialized");

			server = http.createServer((req, res) => {
				res.writeHead(200, {"Content-Type": "text/plain"});
				console.log("\n⟳ Got request to reload plugin. Time: " + new Date().toLocaleTimeString());
				serverRes = res;
			}).listen(port, () => {
				console.log(`\n⟳ Plugin reloader running on port ${port.toString()}`);
			});
			server.timeout = 0;

			// prepare watcher
			let ctx = await context(config);

			// start watching
			await ctx.watch();

		}

		console.log("ESBuild finished: " + (Date.now() - start) + "ms");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();


