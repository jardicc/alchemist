import { ActionDescriptor} from "photoshop/dist/types/photoshop"
import { Descriptor } from 'photoshop/dist/types/UXP'

export interface IAppState {
	settings: ISettings
	actions: IAction[]
	filter: IFilter
}

export type TFilterEvents = "none" | "include" | "exclude";

export interface IFilter{
	searchTerm: null | string
	filterEventsType: TFilterEvents
	exclude: string[]
	include: string[]
	groupSame:boolean
}

export interface ISettings{
	listening: boolean
	currentID: number
	collapsed:boolean
	batchPlayDecorator: boolean
	lastHistoryID:number	
}

export interface IAction{
	id:number
	historyStepTitle: string
	eventName:string
	collapsed:boolean
	descriptor: ActionDescriptor
	timeCreated: number
	playReplies: IPlayReply[]
}

export interface IActionView extends IAction{
	groupedCounter:number
}

export interface IPlayReply{
	descriptors:Descriptor[]
	time:number
}

export function getInitialState():IAppState {
	return {
		filter: {
			searchTerm: null,
			filterEventsType: "exclude",
			exclude: [
				"layersFiltered",
				"toolModalStateChanged",
				"invokeCommand",
				"modalStateChanged"
			],
			include: [],
			groupSame: false
		},
		settings: {
			currentID: 0,
			collapsed:true,
			batchPlayDecorator:false,
			listening: false,
			lastHistoryID:-1			
		},
		actions: [],
	}
}