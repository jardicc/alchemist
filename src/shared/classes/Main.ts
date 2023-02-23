import { renderInspectorUI } from "../../inspector/components/inspectorIndex";
import "./../index.less";
import { Settings } from "../../inspector/classes/Settings";
import photoshop, {core} from "photoshop";
import { renderATNDecoderUI } from "../../atnDecoder/components/atnDecoderIndex";
import { renderSorcererUI } from "../../sorcerer/components/sorcererIndex";
import { FlyoutMenu } from "../../inspector/classes/Flyoutmenu";

export class Main{

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	public static readonly devMode = require("uxp")?.entrypoints?._pluginInfo?._pluginInfo?.source === "devtools";
	// Hacky detection... remove it if you gonna for plugin and need to change ID
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	public static readonly isFirstParty = require("uxp")?.entrypoints?._pluginInfo?.id !== "2bcdb900";
	
	// public static preloadedState:IRootState

	public static start(): void {
		(photoshop.core as any).suppressResizeGripper({ "type": "panel", "target": "inspector", "value": true });
		(photoshop.core as any).suppressResizeGripper({ "type": "panel", "target": "occultist", "value": true });
		(photoshop.core as any).suppressResizeGripper({ "type": "panel", "target": "sorcerer", "value": true });
		renderInspectorUI();
		renderATNDecoderUI();
		renderSorcererUI();
		FlyoutMenu.setup();
	}
}

export type TGlobal = Window & typeof globalThis & {
	Main: Main
};


async function run() {
	(window as TGlobal).Main = Main;

	document.addEventListener("uxpcommand", (event:any) => {
		console.log(event);
		if (event.commandId === "resetStateFn") {
			Settings.reset();
		}
	});
	Main.start();	
}

if (Main.devMode) {
	run();
} else {	
	try {
		run();
	} catch (e:any) {
		core.showAlert({
			message: e.stack,
		});
	}
}