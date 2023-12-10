import {ActionDescriptor} from "photoshop/dom/CoreModules";

export interface IActionSetUUID extends IActionSet {
	__uuid__: string
	actionItems: IActionItemUUID[]
}

export interface IActionItemUUID extends IActionItem {
	__uuid__: string
	__uuidParentSet__: string
	commands: IActionCommandUUID[]
}

export interface IActionCommandUUID extends ICommand {
	__uuid__: string
	__uuidParentAction__: string
	__uuidParentSet__: string
}

export type TSelectActionOperation = "replace" | "add" | "subtract" | "addContinuous" | "subtractContinuous" | "none";

export type TSelectedItem = [string, string?, string?]
export type TExpandedItem = [string, string?]

export interface IATNConverterState {
	data: IActionSetUUID[]
	lastSelected: TSelectedItem | null
	selectedItems: TSelectedItem[]
	expandedItems: TExpandedItem[]
	dontSendDisabled: boolean
}

export interface IActionSet {
	version: number
	actionSetName: string
	expanded: boolean
	actionItems: IActionItem[]
}

export interface IActionItem {
	fKeyIndex: number
	shiftKey: boolean
	commandKey: boolean
	colorIndex: number
	actionItemName: string
	expanded: boolean
	commands: ICommand[]
}

export interface ICommand {
	expanded: boolean
	enabled: boolean
	showDialogs: boolean
	dialogMode: number
	commandName: string
	commandName2: string
	descriptor: ActionDescriptor
}
/*
interface IDescriptor{
	_obj: string
	[prop: string]: any;
}*/

export interface IObjectArrayListInner {
	_unit: string
	list: number[]
}

type TDescDataType =
	/** Reference  */
	"obj " |
	/** Descriptor  */
	"Objc" |
	/** List  */
	"VlLs" |
	/** Double  */
	"doub" |
	/** Unit float  */
	"UntF" |
	/** String  */
	"TEXT" |
	/** Enumerated  */
	"enum" |
	/** Integer  */
	"long" |
	/** Large Integer  */
	"comp" |
	/** Boolean  */
	"bool" |
	/** GlobalObject same as Descriptor  */
	"GlbO" |
	/** Class  */
	"type" |
	/** Class  */
	"GlbC" |
	/** Alias  */
	"alis" |
	/** Alias once more */
	"Pth " |
	/** Raw Data  */
	"tdta" |
	/** ObjectArray */
	"ObAr"

type TRefDataType =
	/** Property */
	"prop" |
	/** Class  */
	"Clss" |
	/** Enumerated Reference  */
	"Enmr" |
	/** Offset  */
	"rele" |
	/** Identifier  */
	"Idnt" |
	/** Index  */
	"indx" |
	/** Name  */
	"name";