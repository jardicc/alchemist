import {renderInspectorUI} from "../../inspector/components/inspectorIndex";
import "./../index.less";
import "./../ThemeVars.less";
import {Settings} from "../../inspector/classes/Settings";
import {core} from "photoshop";
import {renderATNDecoderUI} from "../../atnDecoder/components/atnDecoderIndex";
import {renderSorcererUI} from "../../sorcerer/components/sorcererIndex";
import {FlyoutMenu} from "../../inspector/classes/Flyoutmenu";
import manifest from "./../../../build/manifest.json";
import uxp from "uxp";

interface PluginBase {
	developerPlugin: boolean;
	isFirstParty: boolean;
	isThirdParty: boolean;
	privileged: boolean;
	showPanel(panelId: string): void;
}

export class Main {

	public static plugin: PluginBase = null!;

	static {
		const plugin = [...uxp.pluginManager.plugins].find(p => p.id.endsWith(manifest.id));
		const symbols = Object.getOwnPropertySymbols(plugin);
		const pluginBaseSymbol = symbols.find(s => s.toString() === "Symbol(pluginBase)");

		const result = pluginBaseSymbol ? plugin[pluginBaseSymbol] : plugin;
		if (!("developerPlugin" in result)) {
			throw new Error("Cannot get proper plugin object from pluginManager");
		}
		Main.plugin = result;
	}

	public static get devMode(): boolean {
		return Main.plugin.developerPlugin;
	}

	public static set devMode(value: boolean) {
		Main.plugin.developerPlugin = value;
	}

	public static get isFirstParty(): boolean {
		return Main.plugin.isFirstParty;
	}

	public static set isFirstParty(value: boolean) {
		Main.plugin.isFirstParty = value;
	}

	public static get isThirdParty(): boolean {
		return Main.plugin.isThirdParty;
	}

	public static set isThirdParty(value: boolean) {
		Main.plugin.isThirdParty = value;
	}

	public static get privileged(): boolean {
		return Main.plugin.privileged;
	}

	public static set privileged(value: boolean) {
		Main.plugin.privileged = value;
	}

	public static start(): void {
		const {suppressResizeGripper} = core as any;

		suppressResizeGripper({"type": "panel", "target": "inspector", "value": true});
		suppressResizeGripper({"type": "panel", "target": "occultist", "value": true});
		suppressResizeGripper({"type": "panel", "target": "sorcerer", "value": true});

		renderInspectorUI();
		renderATNDecoderUI();
		renderSorcererUI();
		FlyoutMenu.setup();
	}
}

// eslint-disable-next-line @typescript-eslint/require-await
async function run() {
	console.clear();
	console.log("Alchemist plugin started");
	window.Main = Main;
	if (Main.isFirstParty) {
		Main.plugin.showPanel("inspector");
	}

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	document.addEventListener("uxpcommand", async (event: any) => {
		console.log(event);
		if (event.commandId === "resetStateFn") {
			await Settings.reset();
		}
	});
	Main.start();
}

if (Main.devMode) {
	void run();
} else {
	try {
		void run();
	} catch (e: any) {
		void core.showAlert({
			message: e.stack,
		});
	}
}
