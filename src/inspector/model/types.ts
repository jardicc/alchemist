/* eslint-disable @typescript-eslint/ban-types */
import type { ITargetReferenceAM } from "../classes/GetInfo";
import { TFilterState } from "../components/FilterButton/FilterButton";
import { IActionSetUUID, IATNConverterState } from "../../atnDecoder/atnModel";
import { ISorcererState } from "../../sorcerer/sorModel";
import { ActionDescriptor } from "photoshop/dom/CoreModules";

export type TDialogOptions = "silent" | "dontDisplay" | "display";
export type TModalBehavior = "wait" | "execute" | "fail"
export type TFontSizeSettings = "size-tiny" | "size-small" | "size-default" | "size-bigger" | "size-big" | "size-youMustBeJoking"
/** These will build up reference */
export type TSubTypes = "actionID" | "actionSetID" | "channelID" | "documentID" | "guideID" | "historyID" | "layerID" | "pathID" | "snapshotID"	| "commandIndex"


export type TTargetReference = "listener" |  "generator" | 
	"dispatcher" | "notifier" | "replies" | TPropertyClass;
export type TPropertyClass = "application" | "historyState" | "snapshotClass" | "layer" | "path" | "channel" | "document" | "guide" |
	"actions" | "timeline" | "animationFrameClass" | "animationClass"
export type TPropertyGroup = "hidden" | "optional" | "default" | "1st";
export type ITreeDataTabs =  "content" | "difference" | "reference"|"dom"
export type TActiveInspectorTab = ITreeDataTabs;


export type TGenericViewType = "tree" | "raw";
export type TCodeViewType = "generated" | "options";

export type TExportItems = "selected" | "all";
export type TImportItems = "append" | "replace";

export type TPath = string[];
export type TCategoryReference = "notSpecified";
export type THistoryReference = "selected" | number;
export type TSnapshotReference = "selected" | number;
export type TDocumentReference = "selected" | "all" | number;
export type TLayerReference = "selected" | "all" | number;
export type TPathReference = "selected" | "vectorMask" | "workPathIndex" | number;
export type TGeneratorReference = "full"
export type TChannelReference = "selected" | "all" | TChannelReferenceValid;
export type TChannelReferenceValid =
	| number 
	| "composite" 
	| "RGB" 
	| "red" 
	| "green" 
	| "blue" 
	| "CMYK" 
	| "black" 
	| "cyan" 
	| "magenta" 
	| "yellow" 
	| "lab" 
	| "lightness" 
	| "a" 
	| "b" 
	| "gray" 
	| "monotone" 
	| "duotone" 
	| "tritone" 
	| "quadtone" 
	| "mask" 
	| "transparencyEnum" 
	| "filterMask";
export type TGuideReference = "none" | "all" | number;
export type TActionSet = "none" | number;
export type TActionItem = "none" | number;
export type TActionCommand = "none" | number;

export type TTimeline = "none" | number;
export type TActionFrame = "none" | number;
export type TAnimation = "none" | number;

export type TFilterEvents = "none" | "include" | "exclude";

export type TSelectDescriptorOperation = "replace" | "add" | "subtract" | "addContinuous" | "subtractContinuous" | "none";

export type TProtoMode = "none" | "uxp" | "advanced" | "all";
export type TDescriptorsGrouping = "none" | "eventName"



export interface IInspectorState {
	version: [number, number, number]
	selectedReferenceType: TTargetReference
	filterBySelectedReferenceType: TFilterState
	descriptorsGrouping: TDescriptorsGrouping
	targetReference: ITargetReference
	settings:ISettings
	inspector:IInspector
	descriptors: IDescriptor[]
	dispatcher: IDispatcher

	atnConverter: IATNConverterState
	sorcerer: ISorcererState
	
	explicitlyVisibleTopCategories:TTargetReference[]
}

export type TAllTargetReferences = 
| IRefListener
| IRefDispatcher
| IRefNotifier
| IRefReplies
| IRefGenerator
| IRefApplication
| IRefDocument
| IRefLayer
| IRefPath
| IRefChannel
| IRefActions
| IRefTimeline
| IRefAnimationFrameClass
| IRefAnimationClass
| IRefHistoryState
| IRefSnapshotClass
| IRefGuide

export interface ITargetReference {
	listener: IRefListener
	dispatcher: IRefDispatcher
	notifier: IRefNotifier
	replies: IRefReplies
	generator: IRefGenerator
	application: IRefApplication
	document: IRefDocument
	layer: IRefLayer
	path: IRefPath
	channel: IRefChannel
	actions: IRefActions
	timeline: IRefTimeline
	animationFrameClass: IRefAnimationFrameClass
	animationClass: IRefAnimationClass
	historyState: IRefHistoryState
	snapshotClass: IRefSnapshotClass
	guide: IRefGuide
}

export interface IRefListener{
	type: "listener"	
}
export interface IRefDispatcher{
	type: "dispatcher"	
}
export interface IRefNotifier{
	type: "notifier"	
}
export interface IRefReplies{
	type: "replies"	
}
export interface IRefGenerator{
	type: "generator"	
}

export interface IRefApplication{
	type: "application"	
	properties: string[]
	filterProp: TFilterState
}

export interface IRefDocument{
	type: "document"	
	documentID: number | "selected" | "all"
	properties: string[]
	filterDoc: TFilterState
	filterProp: TFilterState
}

export interface IRefLayer{
	type: "layer"	
	layerID: number | "selected" | "all"
	documentID: number | "selected"
	properties: string[]
	filterLayer: TFilterState
	filterDoc: TFilterState
	filterProp: TFilterState
}

export interface IRefPath{
	type: "path"	
	pathID: number | "selected" | "all" | "workPath" | "vectorMask"
	layerID: number | "selected" | "none"
	documentID: number | "selected"
	properties: string[]

	filterPath: TFilterState
	filterLayer: TFilterState
	filterDoc: TFilterState
	filterProp: TFilterState
}

export interface IRefChannel{
	type: "channel"	
	channelID: number | "selected" | "all" | TChannelReferenceValid
	layerID: number | "selected" | "none"
	documentID: number | "selected"
	properties: string[]
	
	filterChannel: TFilterState
	filterLayer: TFilterState
	filterDoc: TFilterState
	filterProp: TFilterState
}

export interface IRefActions{
	type: "actions"	
	actionSetID: number | "none"
	actionID: number | "none"
	commandIndex: number | "none"
	properties: string[]

	filterActionSet: TFilterState
	filterAction: TFilterState
	filterCommand: TFilterState
	filterProp: TFilterState
}
export interface IRefTimeline{
	type: "timeline"	
	properties: string[]
	filterProp: TFilterState
}
export interface IRefAnimationFrameClass{
	type: "animationFrameClass"	
	properties: string[]
	filterProp: TFilterState
}
export interface IRefAnimationClass{
	type: "animationClass"	
	properties: string[]
	filterProp: TFilterState
}
export interface IRefHistoryState{
	type: "historyState"
	historyID: number | "selected"
	filterHistory:TFilterState


	properties: string[]
	filterProp: TFilterState
}
export interface IRefSnapshotClass{
	type: "snapshotClass"	
	snapshotID: number | "selected"
	filterSnapshot:TFilterState

	properties: string[]
	filterProp: TFilterState
}
export interface IRefGuide{
	type: "guide"	
	guideID: number | "none" | "all"
	documentID: number | "selected"
	properties: string[]

	filterDoc: TFilterState
	filterGuide: TFilterState
	filterProp: TFilterState
}

export interface IDispatcher{
	snippets: [
		{
			content:string
		}
	]
}


//////


export interface IFilterProperty<T>{
	label: string
	value:T
}

/////

export interface ISettings {
	fontSize: TFontSizeSettings
	settingsVisible: boolean
	makeRawDataEasyToInspect: boolean
	selectReferenceBeforeGet: boolean
	autoUpdateInspector: boolean
	groupDescriptors: "none" | "strict"
	searchTerm: string | null

	lastHistoryID: number
	autoUpdateListener: boolean
	autoUpdateSpy: boolean
	lastSelectedItem: string | null
	dontShowMarketplaceInfo: boolean
	activeDescriptors: string[]
	properties: IPropertySettings[]
	maximumItems: number
	leftColumnWidthPx: number
	rightColumnWidthPx: number
	initialDescriptorSettings: IDescriptorSettings
	neverRecordActionNames: string[]
	accordionExpandedIDs: string[]
	
	singleQuotes: boolean
	indent: "tab" | "space1" | "space2" | "space3" | "space4" | "space5" | "space6" | "space7" | "space8"

	codeImports: "none" | "require"
	codeWrappers: "modal" | "batchPlay" | "array" | "objects"
	
	hide_isCommand: boolean
	hideDontRecord: boolean
	hideForceNotify: boolean

	listenerFilter: IListenerNotifierFilter
	notifierFilter: IListenerNotifierFilter
}

export interface IListenerNotifierFilter{
	type: TFilterEvents
	exclude: string[]
	include: string[]
}

export interface IDescriptorSettings {
	supportRawDataType: "mixed" | boolean
	dialogOptions: "mixed" | TDialogOptions | null
	modalBehavior: "mixed" | TModalBehavior | null
	synchronousExecution: "mixed" | boolean | null
}

export interface IPropertySettings {
	type: TPropertyClass
	list: (IPropertyItem|IPropertyGroup)[]
}

export interface IPropertyGroup{
	group: string,
	groupLabel:string,
	data: IPropertyItem[]
}

export interface IPropertyItem {
	label: string
	value: string|number
}

export interface IInspector{
	activeTab: TActiveInspectorTab
	dom: IDOM
	content: IContent
	difference: IDifference
	code: ICode
	info: IReference
}

export interface ICode{
	viewType: "generated"|"options"
}

export interface IDOM{
	treePath: string[]
	autoExpandLevels:number
	expandedTree:TPath[]
}

export interface IContent{
	viewType: TGenericViewType
	search:string
	treePath: string[]
	autoExpandLevels:number
	expandedTree:TPath[]
}

export interface IDifference{
	viewType: TGenericViewType
	treePath: string[]
	autoExpandLevels:number
	expandedTree:TPath[]
}

export interface IReference {
	showOptionalDocumentReference: boolean
}

export interface IDescriptor {
	id: string
	selected: boolean
	crc: number
	startTime: number
	endTime: number
	pinned: boolean
	locked: boolean
	renameMode: boolean
	title: string
	/** filter settings */
	originalReference: TAllTargetReferences
	/** used for AM */
	playAbleData: ITargetReferenceAM | ActionDescriptor[] | null
	/** content */
	recordedData: ActionDescriptor[] | ActionDescriptor | null
	descriptorSettings: IDescriptorSettings
	groupCount?: number
}

export interface IGetNameOutput{
	typeRef: string
	value: string
}

export const enum DocumentMode {
    BITMAP = "bitmapMode",
    CMYK = "CMYKColorMode",
    DUOTONE = "duotoneMode",
    GRAYSCALE = "grayscaleMode",
    INDEXEDCOLOR = "indexedColorMode",
    LAB = "labColorMode",
    MULTICHANNEL = "multichannelMode",
    RGB = "RGBColorMode"
}