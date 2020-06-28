import { Reloader } from "./Reloader";
import { renderUI } from "../components";

export class Main{

	public static reloader = new Reloader(["index.js"], 800);
	//public static settings = new Settings()

	public static start():void {
		renderUI();
		//Main.reloader.start();
	}
}

type TGlobal = Window & typeof globalThis & { Main: Main };
(window as TGlobal).Main = Main;

Main.start();