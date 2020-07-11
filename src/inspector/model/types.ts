import type { ITargetReferenceAM } from "../classes/GetInfo";
import type { Descriptor } from "photoshop/dist/types/UXP";


export type TTargetReference = "customDescriptor" | "featureData" | "generator" | TPropertyClass;
export type TPropertyClass = "application" | "history" | "snapshot" | "layer" | "path" | "channel" | "document" | "guide" | "action";
export type TPropertyType = "hidden" | "optional" | "default";
export type TActiveInspectorTab = "content" | "difference" | "reference";
export type TViewType = "tree" | "raw";
export type TActiveSection = "descriptors" | "settings";

//export type TActiveTargetReference = null|Record<string, unknown>|ITargetReferenceApplication|ITargetReferenceCustomDescriptor|ITargetReferenceHistory|ITargetReferenceSnapshot|ITargetReferenceLayer|ITargetReferencePath|ITargetReferenceChannel|ITargetReferenceDocument|ITargetReferenceGuide|ITargetReferenceAction 

export type TBaseProperty = "notSpecified" | "anySpecified";
export type THistoryReference = "active" | number;
export type TSnapshotReference = "active" | number;
export type TDocumentReference = "active" | number;
export type TLayerReference = "active" | number;
export type TPathReference = "active" | "vectorMask" | "workPathIndex" | number;
export type TChannelReference = "active" | TChannelReferenceValid;
export type TChannelReferenceValid = "composite" | "RGB" | "red" | "green" | "blue" | "CMYK" | "black" | "cyan" | "magenta" | "yellow" | "lab" | "lightness" | "a" | "b" | "gray" | "monotone" | "duotone" | "tritone" | "quadtone" | "mask" | "transparencyEnum" | "filterMask" | number;
export type TGuideReference = "undefined" | "active" | number;
export type TActionSet = "undefined"|string;
export type TActionItem = "undefined"|string;
export type TActionCommand = "undefined" | string;

export type TSelectDescriptorOperation = "replace" | "add" | "subtract";
export interface IRefWrapper<T,D>{
	type: T
	data:D
}

export interface IInspectorState {
	activeSection: TActiveSection
	selectedReferenceType:TTargetReference
	targetReference: TTargetReferenceArr
	settings:ISettings
	inspector:IInspector
	descriptors:IDescriptor[]
}

export type TTargetReferenceArr = TActiveTargetReferenceArr[]

export type TActiveTargetReferenceArr = IRefWrapper<"application", ITargetReferenceApplication> |
	IRefWrapper<"customDescriptor", ITargetReferenceCustomDescriptor> |
	IRefWrapper<"history", ITargetReferenceHistory> |
	IRefWrapper<"snapshot", ITargetReferenceSnapshot> |
	IRefWrapper<"layer", ITargetReferenceLayer> |
	IRefWrapper<"path", ITargetReferencePath> |
	IRefWrapper<"channel", ITargetReferenceChannel> |
	IRefWrapper<"document", ITargetReferenceDocument> |
	IRefWrapper<"guide", ITargetReferenceGuide> |
	IRefWrapper<"action", ITargetReferenceAction>|
	IRefWrapper<"generator", ITargetReferenceGenerator>
	;

//////

export interface ITargetReferenceApplication{
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceCustomDescriptor{
	category:{value:string,filterBy:boolean}
}
export interface ITargetReferenceHistory{
	document:{value: TDocumentReference,filterBy:boolean},
	history:{value: THistoryReference,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceSnapshot{
	document:{value: TDocumentReference,filterBy:boolean},
	snapshot:{value: TSnapshotReference,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceLayer{
	document:{value: TDocumentReference,filterBy:boolean},
	layer:{value:TLayerReference,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferencePath{
	document:{value: TDocumentReference,filterBy:boolean},
	path:{value:TPathReference,filterBy:boolean},
	layer:{value:TLayerReference,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceChannel{
	document:{value: TDocumentReference,filterBy:boolean},
	channel:{value:TChannelReference,filterBy:boolean},
	layer:{value:TLayerReference,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceDocument{
	document:{value: TDocumentReference,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceGuide{
	document:{value: TDocumentReference,filterBy:boolean},
	guide:{value:TGuideReference,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceAction{
	actionset:{value: string,filterBy:boolean},
	action:{value:string,filterBy:boolean},
	command:{value:string,filterBy:boolean},
	property:{value: string,filterBy:boolean}
}
export interface ITargetReferenceGenerator{
	kind:{value: "full",filterBy:boolean}
}

/////

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
	calculatedReference: TActiveTargetReferenceArr,
	originalData: Descriptor[]
}