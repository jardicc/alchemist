export interface IActionSet{
	version: number
	actionSetName: string
	expanded: boolean
	actionItems:IActionItem[]
}

export interface IActionItem{
	fKeyIndex:number
	shiftKey: boolean
	commandKey: boolean
	colorIndex: number
	actionItemName: string
	expanded: boolean
	commands:ICommand[]
}

export interface ICommand{
	expanded: boolean
	enabled: boolean
	showDialogs: boolean
	dialogMode: number
	commandName: string
	commandName2: string
	descriptor:IDescriptor
}

interface IDescriptor{
	_obj: string
	[prop: string]: any;
}

export interface IObjectArrayListInner{
	_unit: string
	list:number[]
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