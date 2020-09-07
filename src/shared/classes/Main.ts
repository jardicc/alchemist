import { Reloader } from "../../listener/classes/Reloader";
import { renderInspectorUI } from "../../inspector/components/inspectorIndex";
import { ListenerClass } from "./../../inspector/classes/Listener";
import "./../index.less";

export class Main{

	public static reloader = new Reloader(["index.js"], 800);
	//public static settings = new Settings()

	

	public static start(): void {
		ListenerClass.init();
		//renderListenerUI();
		renderInspectorUI();
		//Main.reloader.start();
	}
}

type TGlobal = Window & typeof globalThis & { Main: Main };
(window as TGlobal).Main = Main;

Main.start();