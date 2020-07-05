import { Reloader } from "./Reloader";
import { renderListenerUI } from "../components";
import { renderInspectorUI } from "../../inspector/components/inspectorIndex";

export class Main{

	public static reloader = new Reloader(["index.js"], 800);
	//public static settings = new Settings()

	public static start():void {
		renderListenerUI();
		renderInspectorUI();
		//Main.reloader.start();
	}
}

type TGlobal = Window & typeof globalThis & { Main: Main };
(window as TGlobal).Main = Main;

Main.start();