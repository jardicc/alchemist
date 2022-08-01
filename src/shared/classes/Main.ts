import { renderInspectorUI } from "../../inspector/components/inspectorIndex";
import "./../index.less";
import { Settings } from "../../inspector/classes/Settings";
import photoshop, {core} from "photoshop";
import { renderATNDecoderUI } from "../../atnDecoder/components/atnDecoderIndex";
import { renderSorcererUI } from "../../sorcerer/components/sorcererIndex";
import { FlyoutMenu } from "../../inspector/classes/Flyoutmenu";

export class Main{

	public static readonly devMode = require("uxp")?.entrypoints?._pluginInfo?._pluginInfo?.source === "devtools";

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

function run() {
	type TGlobal = Window & typeof globalThis & { Main: Main };
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