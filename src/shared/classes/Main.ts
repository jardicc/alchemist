import { renderInspectorUI } from "../../inspector/components/inspectorIndex";
import { ListenerClass } from "./../../inspector/classes/Listener";
import "./../index.less";
import { Settings } from "../../inspector/classes/Settings";
import photoshop from "photoshop";

export class Main{

	public static start(): void {
		ListenerClass.init();
		(photoshop.core as any).suppressResizeGripper({ "type": "panel", "target": "inspector", "value": true });
		renderInspectorUI();
	}
}

type TGlobal = Window & typeof globalThis & { Main: Main };
(window as TGlobal).Main = Main;
document.addEventListener("uxpcommand", (event:any) => {
	console.log(event);
	if (event.commandId === "resetStateFn") {
		Settings.reset();
	}
});
Main.start();