import { ActionDescriptor } from "photoshop/dom/CoreModules";
import { Main } from "../../shared/classes/Main";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
import { action, app } from "../../shared/imports";
import {IDescriptor, IDescriptorSettings, ITargetReference} from "../model/types";
import {GetInfo, ITargetReferenceAM} from "./GetInfo";
import {Helpers} from "./Helpers";
import {RawDataConverter} from "./RawDataConverter";
import {stringIDs} from "./StringIDs";
import {str as crc} from "crc-32";
import {rootStore} from "../../shared/store";
import {setSpyInstalledAction} from "../actions/inspectorActions";

export type TNotificationListenerCb = (event: string, descriptor: ActionDescriptor) => Promise<void>
//type eventsArray = {event: string}[];

export class ListenerClass{	

	private static listenerCb:TNotificationListenerCb | null = null;
	private static inspectorCb:TNotificationListenerCb | null = null;
	//private static listenerAMHackCb:TNotificationListenerCb = async (event: string, descriptor: any) => { };

	private static eventsArrayCache: string[] | null = null;
	private static spyInterval: number | null = null;

	/**
	 * Find out whether special CEP panel is installed
	 */
	public static async getSpyInstalled() {
		const result = await action.batchPlay(
			[
				{
					_obj: "get",
					_target: [
						{
							_property: "panelList",
						},
						{
							_ref: "application",
							_enum: "ordinal",
							_value: "targetEnum",
						},
					],
					_options: {
						dialogOptions: "dontDisplay",
					},
				},
			],
			{
				modalBehavior: "execute",
			},
		);

		const found = !!result["0"].panelList.find((panel: any) => panel.ID === "panelid.dynamic.swf.csxs.cz.bereza.spy.panel");
		if (found) {
			rootStore.dispatch(setSpyInstalledAction(found));
		}
	}

	private static get allEventsArray() {
		if (!this.eventsArrayCache) {
			this.eventsArrayCache = stringIDs.map(id => (id));
		}
		return this.eventsArrayCache;
	}

	public static startSpy(neverRecordActionNames: string[], initialDescriptorSettings: IDescriptorSettings, onAddDescriptor: (descriptor: IDescriptor) => void) {
		ListenerClass.spyInterval = window.setInterval(async () => {
			try {
				const response = await fetch("http://127.0.0.1:10311/api");
				const descriptor = await response.json();
				if (!descriptor?.length) {
					return;
				}
				if (!Array.isArray(descriptor)) {
					return;
				}
				descriptor.forEach(desc => {
					const event = desc._obj;
		
					if (neverRecordActionNames.includes(event)) {
						return;
					}
			
					const category = "listener"; //desc?._isCommand ? "listener" : "notifier";
			
					// if (category === "notifier") {debugger;}
			
					// delete because it will be added as a first later
					delete desc._obj;
			
					console.log(event);
					const originalReference:ITargetReference = {
						type: category,
						data: [],
					};
					const descWithEvent: ITargetReferenceAM = {
						_obj:event,
						...desc,
					};
			
					const descCrc = crc(JSON.stringify(descWithEvent));
					const originalData = RawDataConverter.replaceArrayBuffer(descWithEvent);
			
					const result: IDescriptor = {
						endTime: 0,
						startTime: 0,
						crc: descCrc,
						id: Helpers.uuidv4(),
						locked: false,
						originalData,
						originalReference,
						pinned: false,
						selected: false,
						renameMode: false,
						calculatedReference: descWithEvent,
						title: "[S] " + GetInfo.generateTitle(originalReference, descWithEvent),
						descriptorSettings: initialDescriptorSettings,
					};
			
					//this.props.setLastHistoryID;
					onAddDescriptor(result);				
					
				});
			} catch (e) {
				console.warn("Not spying");
			}
		},1000);
	}

	public static stopSpy() {
		if (ListenerClass.spyInterval !== null) {
			clearInterval(ListenerClass.spyInterval);
			ListenerClass.spyInterval = null;
		}
	}

	public static startListener(cb: TNotificationListenerCb): void{
		this.listenerCb = cb;
		//ListenerClass.addAMConverterHack();
		if (Main.devMode || Main.isFirstParty) {
			//app.eventNotifier = this.listenerCb;
			action.addNotificationListener(["all"], this.listenerCb);
		} else {
			action.addNotificationListener(this.allEventsArray, this.listenerCb);
		}
	}

	public static stopListener(): void{
		//this.removeAMConverterHack();
		if (!this.listenerCb) {return;}
		if (Main.devMode || Main.isFirstParty) {
			//app.eventNotifier = () => { };
			action.removeNotificationListener(["all"], this.listenerCb);
		} else {
			action.removeNotificationListener(this.allEventsArray, this.listenerCb);			
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