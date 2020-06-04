import { Reloader } from "./Reloader";
import { Settings } from "./Settings";
import { renderUI } from "../components";

export class Main{

	public static reloader = new Reloader(["index.js"], 800);
	//public static settings = new Settings()

	constructor() {
		
	}

	public static start() {
		renderUI();
		//Main.reloader.start();
	}

}

(window as any).Main = Main;

Main.start();