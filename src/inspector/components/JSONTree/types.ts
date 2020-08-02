
import {TProtoMode, TPath} from "../../model/types";


export type TNonNullish = Record<string, unknown>;


export type TData= TNonNullish;
export type THideRoot= boolean;
export type TInvertTheme=  boolean;
export type TKeyPath= (string | number)[];
export type TValue=any
export type TCircularCache=any
export type TIsCircular= boolean 
export type TCollectionLimit=number

///


// eslint-disable-next-line @typescript-eslint/ban-types
export type TSortObjectKeys =  (((a: string, b: string) => number) | undefined) | boolean;
export type TShouldExpandNode = (keyPath: TPath, data: TNonNullish, level: number) => boolean;
export type TGetItemString = (type: string, data: TNonNullish, itemType: JSX.Element, itemString: string) => JSX.Element;
export type TLabelRenderer = (keyPath: TPath, nodeType: TNodeType, expanded: boolean, expandable: boolean) => JSX.Element;
export type TExpandClicked = (keyPath: TPath, expanded: boolean, recursive:boolean)=>void;
export type TValueRenderer = (displayValue: string | number, rawValue?: string | number | boolean | null, nodeType?: TNodeType|undefined, ...keyPath: TPath) => React.ReactNode;
export type TPostprocessValue = (displayValue: string | number, rawValue?: string | number | boolean | null, nodeType?: TNodeType|undefined, ...keyPath: TPath) => React.ReactNode;
export type TIsCustomNode = (arg?: any) => boolean;
export type TValueGetter = (value: any) => any;

export type TNodeType = "Object" | "Error" | "WeakMap" | "WeakSet" | "Array" | "Iterable" | "Map" | "Set" | "String" | "Number" | "Boolean" | "Date" | "Null" | "Undefined" | "Function" | "Symbol" | "Custom";

/*
export interface ISettings{
	shouldExpandNode?: TShouldExpandNode
	hideRoot?: THideRoot
	keyPath?: TKeyPath
	getItemString?: TGetItemString
	labelRenderer?: TLabelRenderer
	valueRenderer?: TValueRenderer
	postprocessValue?: TPostprocessValue
	isCustomNode?: TIsCustomNode
	collectionLimit?: TCollectionLimit
	invertTheme?: TInvertTheme
	protoMode?: TProtoMode
	data: TData
}*/

export interface IRenderChildNodesProps{
	nodeType:TNodeType
	data:any
	collectionLimit:number
	circularCache:TCircularCache
	keyPath:TKeyPath
	postprocessValue:TPostprocessValue
	sortObjectKeys: TSortObjectKeys
	level:number
}

export interface IDefSettings{
	collectionLimit: TCollectionLimit
	data: any
	getItemString: TGetItemString
	hideRoot: THideRoot
	isCustomNode: TIsCustomNode
	keyPath: TKeyPath
	labelRenderer: TLabelRenderer
	postprocessValue: TPostprocessValue
	protoMode: TProtoMode
	shouldExpandNode: TShouldExpandNode
	sortObjectKeys:boolean
	valueRenderer: TValueRenderer
	expandClicked: TExpandClicked
}

export interface IJSONNestedNode{
	getItemString: TGetItemString
	nodeTypeIndicator?: string
	nodeType: TNodeType
	data: any
	hideRoot: boolean
	createItemString: any
	collectionLimit?: number,
	keyPath: TKeyPath
	labelRenderer: TLabelRenderer
	shouldExpandNode?: TShouldExpandNode
	level: number
	sortObjectKeys?: TSortObjectKeys
	isCircular?: boolean
	expandable?: boolean
	protoMode?: string
}

export interface IJSONNodeProps extends IDefSettings{
	value: any
}

export interface IDefSimpleNodeProps extends ISimpleNodeProps{
	valueGetter: TValueGetter
}

export interface ISimpleNodeProps{
	getItemString: TGetItemString;
	key: string | number;
	keyPath: TKeyPath;
	labelRenderer: TLabelRenderer;
	nodeType: TNodeType;
	value: any;
	valueRenderer: TValueRenderer;
}

export interface INestedNodeProps extends ISimpleNodeProps{
	data: any;
	protoMode: TProtoMode;
	isCustomNode: TIsCustomNode;
	collectionLimit: number;
	hideRoot: boolean;
	postprocessValue: TPostprocessValue;
	shouldExpandNode: TShouldExpandNode;
	sortObjectKeys: boolean;
}


export interface INestedNodePropsDef extends INestedNodeProps{
	circularCache:any[]
	createItemString: any,
	expandable: boolean,
	isCircular: boolean,
	key: string|number
	level: number,
	nodeType:TNodeType
	nodeTypeIndicator:any,
}

export interface IItemRange{
	from: number
	to: number
	renderChildNodes: any
	nodeType: TNodeType
}

export interface IItemState{
	expanded: boolean
}

export interface IArrow{
	arrowStyle: "single" | "double"
	expanded: boolean
	nodeType:string
	onClick: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined
}