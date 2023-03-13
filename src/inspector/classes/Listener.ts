/* eslint-disable @typescript-eslint/no-empty-function */
import { ActionDescriptor } from "photoshop/dom/CoreModules";
import { Main } from "../../shared/classes/Main";
import { action } from "../../shared/imports";
import {events} from "./StringIDs";

export type TNotificationListenerCb = (event: string, descriptor: ActionDescriptor) => Promise<void>

export class ListenerClass{	

	private static spyCb:TNotificationListenerCb | null = null;
	private static listenerCb:TNotificationListenerCb | null = null;
	private static inspectorCb: TNotificationListenerCb | null = null;
	private static universalEvents = ["get", ...events].map(e => ({event: e, universal: true} as any));
	//private static listenerAMHackCb:TNotificationListenerCb = async (event: string, descriptor: any) => { };

	public static startSpy(cb: TNotificationListenerCb) {
		this.spyCb = cb;
		if (Main.isFirstParty) {
			action.addNotificationListener(this.universalEvents,this.spyCb);
		}
	}

	public static stopSpy() {
		if (!this.spyCb) {return;}
		if (Main.isFirstParty){
			action.removeNotificationListener(this.universalEvents, this.spyCb);			
		}
		this.spyCb = null;
	}

	public static startListener(cb: TNotificationListenerCb): void{
		this.listenerCb = cb;
		//ListenerClass.addAMConverterHack();
		if (Main.devMode || Main.isFirstParty) {
			//app.eventNotifier = this.listenerCb;
			action.addNotificationListener(["all"], this.listenerCb);
		} else {
			action.addNotificationListener(events, this.listenerCb);
		}
	}

	public static stopListener(): void{
		//this.removeAMConverterHack();
		if (!this.listenerCb) {return;}
		if (Main.devMode || Main.isFirstParty) {
			//app.eventNotifier = () => { };
			action.removeNotificationListener(["all"], this.listenerCb);
		} else {
			action.removeNotificationListener(events, this.listenerCb);			
		}
		this.listenerCb = null;
	}

	public static startInspector(cb: TNotificationListenerCb): void{
		this.inspectorCb = cb;
		action.addNotificationListener(["select"], this.inspectorCb);
	}

	public static stopInspector(): void{
		if (!this.inspectorCb) {return; }
		action.removeNotificationListener(["select"], this.inspectorCb);			
		this.inspectorCb = null;
	}

	// AM coverter hack
/*
	public static addAMConverterHack() {
		ListenerClass.listenerAMHackCb = async (event, descriptor) => {
			const eventName = descriptor._isReference ? "_ref" : descriptor._alchemistAMHack._obj;
			this.listenerCb(eventName, descriptor._alchemistAMHack);
		};
		action.addNotificationListener([{ event: "17d1f0b1-653d-11e0-ae3e-0800200c9a66"}],ListenerClass.listenerAMHackCb);
	}

	public static removeAMConverterHack() {
		action.removeNotificationListener([{ event: "17d1f0b1-653d-11e0-ae3e-0800200c9a66"}], ListenerClass.listenerAMHackCb);
	}

*/
}