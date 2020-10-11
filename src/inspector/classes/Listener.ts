import { Main } from "../../shared/classes/Main";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
import { action, app } from "../../shared/imports";
import { stringIDs } from "./StringIDs";

export type TNotificationListenerCb = (event: string, descriptor: any) => Promise<void>
type eventsArray = {event: string}[];

export class ListenerClass{	

	private static listenerCb:TNotificationListenerCb = async (event: string, descriptor: any) => { };
	private static inspectorCb:TNotificationListenerCb = async (event: string, descriptor: any) => { };

	private static eventsArrayCache:eventsArray|null = null;

	private static get allEventsArray() {
		if (!this.eventsArrayCache) {
			this.eventsArrayCache = stringIDs.map(id => ({ event: id }));
		}
		return this.eventsArrayCache;
	}

	public static startListener(cb: TNotificationListenerCb): void{
		this.listenerCb = cb;
		if (Main.devMode) {
			app.eventNotifier = this.listenerCb;
		} else {
			action.addNotificationListener(this.allEventsArray, this.listenerCb);			
		}
	}

	public static stopListener(): void{
		if (Main.devMode) {
			app.eventNotifier = () => { };
		} else {
			action.removeNotificationListener(this.allEventsArray, this.listenerCb);			
		}
	}

	public static startInspector(cb: TNotificationListenerCb): void{
		this.inspectorCb = cb;
		action.addNotificationListener([{ event: "select"}], this.inspectorCb);
	}

	public static stopInspector(): void{
		action.removeNotificationListener([{ event: "select"}], this.inspectorCb);
	}
}