import { ITargetReferenceAM } from "../classes/GetInfo";
import { Descriptor } from "photoshop/dist/types/UXP";

export type TTargetReference = "undefined" | "customDescriptor" | "featureData" | "allFromGenerator" | TPropertyClass;
export type TPropertyClass = "application" | "history" | "snapshot" | "layer" | "path" | "channel" | "document" | "guide" | "action";
export type TPropertyType = "hidden" | "optional" | "default";
export type TActiveInspectorTab = "content" | "difference" | "reference";
export type TViewType = "tree" | "raw";
export type TActiveSection = "descriptors" | "settings";

export type TActiveTargetReference = null|Record<string, unknown>|ITargetReferenceApplication|ITargetReferenceCustomDescriptor|ITargetReferenceHistory|ITargetReferenceSnapshot|ITargetReferenceLayer|ITargetReferencePath|ITargetReferenceChannel|ITargetReferenceDocument|ITargetReferenceGuide|ITargetReferenceAction 

export type TBaseProperty = "undefined" | "notSpecified" | "anySpecified";
export type TDocumentReference = "undefined" | "active" | number;
export type TLayerReference = "undefined" | "active" | number;
export type TPathReference = "undefined" | "active" | "vectorMask" | "workPathIndex" | number;
export type TChannelReference = "undefined" | "active" | "composite" | "RGB" | "red" | "green" | "blue" | "CMYK" | "black" | "cyan" | "magenta" | "yellow" | "lab" | "lightness" | "a" | "b" | "gray" | "monotone" | "duotone" | "tritone" | "quadtone" | "mask" | "transparencyEnum" | "filterMask" | number;
export type TGuideReference = "undefined" | "active" | number;
export type TActionSet = "undefined"|string;
export type TActionItem = "undefined"|string;
export type TActionCommand = "undefined" | string;

export type TSelectDescriptorOperation = "replace" | "add" | "subtract";

export interface IInspectorState {
	activeSection:TActiveSection
	targetReference: ITargetReference
	settings:ISettings
	inspector:IInspector
	descriptors:IDescriptor[]
}

export interface ITargetReference{
	activeType: TTargetReference,
	application: ITargetReferenceApplication,
	customDescriptor: ITargetReferenceCustomDescriptor,
	history: ITargetReferenceHistory,
	snapshot: ITargetReferenceSnapshot,
	layer: ITargetReferenceLayer,
	path: ITargetReferencePath,
	channel: ITargetReferenceChannel,
	document: ITargetReferenceDocument,
	guide: ITargetReferenceGuide,
	action: ITargetReferenceAction,
	featureData: Record<string, unknown>,
	allFromGenerator: Record<string, unknown>,
}

export interface ITargetReferenceApplication{
	property: string
}
export interface ITargetReferenceCustomDescriptor{
	category:string
}
export interface ITargetReferenceHistory{
	document: TDocumentReference,
	property: string
}
export interface ITargetReferenceSnapshot{
	document: TDocumentReference,
	property: string
}
export interface ITargetReferenceLayer{
	document: TDocumentReference,
	layer:TLayerReference,
	property: string
}
export interface ITargetReferencePath{
	document: TDocumentReference,
	path:TPathReference,
	layer:TLayerReference,
	property: string
}
export interface ITargetReferenceChannel{
	document: TDocumentReference,
	channel:TChannelReference,
	layer:TLayerReference,
	property: string
}
export interface ITargetReferenceDocument{
	document: TDocumentReference,
	property: string
}
export interface ITargetReferenceGuide{
	document: TDocumentReference,
	guide:TGuideReference,
	property: string
}
export interface ITargetReferenceAction{
	actionset: string,
	action:string,
	command:string,
	property: string
}
/*export interface ITargetReferenceFeatureData{

}
export interface ITargetReferenceAllFromGenerator{

}*/


export interface ISettings{
	selectReferenceBeforeGet: boolean,
	autoUpdate: boolean,
	activeDescriptors:string[],
	properties:IPropertySettings[]
	maximumItems:number
}

export interface IPropertySettings {
	type: TPropertyClass
	list: IPropertyItem[]
}

export interface IPropertyItem {
	title: string,
	stringID: string,
	type: TPropertyType
}

export interface IInspector{
	activeTab:TActiveInspectorTab,
	content: IContent
	difference: IDifference
	reference: IReference
}

export interface IContent{
	viewType: TViewType
	treePath:string[]
}

export interface IDifference{
	viewType: TViewType
	treePath:string[]
}

export interface IReference {
	showOptionalDocumentReference: boolean
}

export interface IDescriptor{
	id: string
	selected: boolean
	startTime: number
	endTime: number
	pinned: boolean,
	locked: boolean,
	originalReference: ITargetReferenceAM,
	originalData: Descriptor[]
}

export function getInitialState():IInspectorState {
	return {
		activeSection:"descriptors",
		targetReference: {
			activeType: "layer",
			application: {
				property: "abc"
			},
			customDescriptor: {
				category:"abc"
			},
			history: {
				document: 123,
				property: "abc"
			},
			snapshot: {
				document: 123,
				property: "abc"
			},
			layer: {
				document: "active",
				layer:"active",
				property: "name"
			},
			path: {
				document: 123,
				path:123,
				layer:123,
				property: "abc"
			},
			channel: {
				document: 123,
				channel:123,
				layer:123,
				property: "abc"
			},
			document: {
				document: 123,
				property: "abc"
			},
			guide: {
				document: 123,
				guide:123,
				property: "abc"
			},
			action: {
				actionset: "abc",
				action:"abc",
				command:"abc",
				property: "abc"
			},
			featureData: {},
			allFromGenerator: {},
		},
		settings: {
			selectReferenceBeforeGet: true,
			autoUpdate: false,
			activeDescriptors:["uuid1, uuid2"],
			properties: [
				{ 
					type: "application" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
				{ 
					type: "history" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
				{ 
					type: "snapshot" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
				{ 
					type: "layer" ,
					list:[
						{
							title:"Name",
							stringID:"name",
							type:"default"
						},
						{
							title:"b",
							stringID:"b",
							type:"optional"
						},
						{
							title:"c",
							stringID:"c",
							type:"hidden"
						},
						{
							title:"d",
							stringID:"d",
							type:"hidden"
						}
					]
				},
				{ 
					type: "path" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
				{ 
					type: "channel" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
				{ 
					type: "document" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
				{ 
					type: "guide" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
				{ 
					type: "action" ,
					list:[
						{
							title:"",
							stringID:"",
							type:"default"
						}
					]
				},
			],
			maximumItems:200
		},
		inspector: {
			activeTab: "content",
			content: {
				viewType: "tree",
				treePath: ["a", "b", "c"],				
			},
			difference: {
				viewType: "tree",
				treePath: ["a", "b", "c"],				
			},
			reference: {
				showOptionalDocumentReference:true,
			}
		},
		descriptors: [
		]
	};
}