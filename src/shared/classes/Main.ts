import { Reloader } from "../../listener/classes/Reloader";
import { renderListenerUI } from "../../listener/components";
import { renderInspectorUI } from "../../inspector/components/inspectorIndex";
import { ThemeManager } from "./ThemeManager";
import { ListenerClass } from "./../../inspector/classes/Listener";
import "./../index.less";

export class Main{

	public static reloader = new Reloader(["index.js"], 800);
	//public static settings = new Settings()

	

	public static start(): void {
		ListenerClass.init();
		renderListenerUI();
		renderInspectorUI();
		//Main.reloader.start();
		ThemeManager.start();
	}
}

type TGlobal = Window & typeof globalThis & { Main: Main };
(window as TGlobal).Main = Main;

Main.start();