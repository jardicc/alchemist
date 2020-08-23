/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
import { app } from "../../shared/imports";


export class ListenerClass{	

	public static listenerCb = async (event: string, descriptor: any) => { };
	public static inspectorCb = async (event: string, descriptor: any) => { };
	
	public static init(): void {
		console.log("init");
		app.eventNotifier = (event: string, descriptor: any) => {
			console.log("event");
			this.listenerCb(event, descriptor);
			this.inspectorCb(event, descriptor);
		};
	}

	public static stop():void {
		app.eventNotifier = () => { console.log("Listener stop"); };
	}
}