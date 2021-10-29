/* eslint-disable @typescript-eslint/no-var-requires */
import { renderInspectorUI } from "../../inspector/components/inspectorIndex";
import { ListenerClass } from "./../../inspector/classes/Listener";
import "./../index.less";
import { Settings } from "../../inspector/classes/Settings";
import photoshop from "photoshop";
import { AMHackFileFactory } from "../../inspector/classes/AMHackFileFactory";
import { renderATNDecoderUI } from "../../atnDecoder/components/atnDecoderIndex";
import { renderSorcererUI } from "../../sorcerer/components/sorcererIndex";

export class Main{

	public static readonly devMode = require("uxp")?.entrypoints?._pluginInfo?._pluginInfo?.source === "devtools";

	public static start(): void {
		(photoshop.core as any).suppressResizeGripper({ "type": "panel", "target": "inspector", "value": true });
		(photoshop.core as any).suppressResizeGripper({ "type": "panel", "target": "occultist", "value": true });
		(photoshop.core as any).suppressResizeGripper({ "type": "panel", "target": "sorcerer", "value": true });
		AMHackFileFactory.createFileToInclude();
		renderInspectorUI();
		renderATNDecoderUI();
		renderSorcererUI();
		AMHackFileFactory.getHackCode();

		
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
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		require("photoshop").core.showAlert({
			message: e.stack,
		});
	}
}