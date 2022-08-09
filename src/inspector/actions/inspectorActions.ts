import { TActiveInspectorTab, IDescriptor, TTargetReference, TSelectDescriptorOperation, ITargetReference, TSubTypes, ITreeDataTabs, TPath, TFilterEvents, TImportItems, IInspectorState, TGenericViewType, TCodeViewType, TFontSizeSettings, IDescriptorSettings, ISettings, IListenerNotifierFilter } from "../model/types";
import { TState } from "../components/FilterButton/FilterButton";
import { IRootState } from "../../shared/store";


export interface ISetModeTab {
	type: "SET_MODE_TAB"
	payload: TActiveInspectorTab
}

export interface ISetTargetReference {
	type: "SET_TARGET_REFERENCE"
	payload: ITargetReference
}

export interface IAddDescriptorAction {
	type: "ADD_DESCRIPTOR"
	payload: {
		arg:IDescriptor,
		replace:boolean
	}
}

export interface ISetSelectedReferenceTypeAction {
	type: "SET_SELECTED_REFERENCE_TYPE_ACTION"
	payload: TTargetReference
}

export interface ISelectDescriptor {
	type: "SELECT_DESCRIPTOR"
	payload: {
		operation:TSelectDescriptorOperation
		uuid?: string
		crc?:number
	}
}

export interface IToggleAccordionAction{
	type: "TOGGLE_ACCORDION"
	payload: {
		id: string
		expanded: boolean		
	}
}

export interface IToggleSettingsAction{
	type: "TOGGLE_SETTINGS"
	payload:null
}

export interface IClearViewAction{
	type: "CLEAR_VIEW"
	payload:{keep:boolean}
}
export interface IClearAction{
	type: "CLEAR"
	payload:null
}
export interface IClearNonExistentAction{
	type: "CLEAR_NON_EXISTENT"
	payload:null
}
export interface ILockDescAction{
	type: "LOCK_DESC"
	payload: {
		lock:boolean,uuids:string[]
	}
}
export interface IPinDescAction{
	type: "PIN_DESC"
	payload: {
		pin:boolean,uuids:string[]
	}
}
export interface IRemoveDescAction{
	type: "REMOVE_DESC"
	payload:string[]
}
export interface IImportStateAction{
	type: "IMPORT_STATE"
	payload:IRootState
}
export interface IImportItemsAction{
	type: "IMPORT_ITEMS"
	payload: {
		items: IDescriptor[],
		kind: TImportItems
	}
}
export interface IImportReplaceAction{
	type: "IMPORT_REPLACE"
	payload:null
}
export interface IExportSelectedDescAction{
	type: "EXPORT_SELECTED_DESC"
	payload:null
}
export interface IExportAllDescAction{
	type: "EXPORT_ALL_DESC"
	payload:null
}
export interface IExportStateAction{
	type: "EXPORT_STATE"
	payload:null
}
export interface ISetFilterStateAction {
	type: "SET_FILTER_STATE"
	payload: {
		type: TTargetReference,
		subType: TSubTypes | "main",
		state: TState
	}
}

export interface ISetInspectorPathDiffAction{
	type: "SET_INSPECTOR_PATH_DIFF"
	payload: {
		path: string[]
		mode: "replace"|"add"
	}
}

export interface ISetInspectorPathContentAction{
	type: "SET_INSPECTOR_PATH_CONTENT"
	payload: {
		path: string[]
		mode: "replace"|"add"
	}
}

export interface ISetInspectorPathDOMAction{
	type: "SET_INSPECTOR_PATH_DOM"
	payload: {
		path: string[]
		mode: "replace"|"add"
	}
}

export interface ISetExpandedPathAction{
	type: "SET_EXPANDED_PATH",
	payload: {
		type: ITreeDataTabs
		path: TPath,
		expand: boolean
		recursive: boolean
		data:any
	}
}

export interface IListenerAction{
	type:"SET_LISTENER",
	payload:boolean
}
export interface IAutoInspectorAction{
	type:"SET_AUTO_INSPECTOR",
	payload:boolean
}

// filter

export interface ISetSearchTermAction{	
	type: "SET_SEARCH_TERM_ACTION",
	payload: string|null
}

export interface ISetListenerNotifierAction{
	type: "SET_LISTENER_NOTIFIER"
	payload: {
		data: Partial<IListenerNotifierFilter>
	}
}

/*
export interface IGroupSameAction{	
	type: "GROUP_SAME_ACTION",
	payload: boolean
}
*/
export interface IFilterEventNameAction{
	type: "FILTER_EVENT_NAME_ACTION",
	payload: {
		eventName: string,
		kind: "include" | "exclude",
		operation: "add" | "remove"
	}
}

export interface IReplaceWholeState{
	type: "REPLACE_WHOLE_STATE",
	payload: IInspectorState
}

export interface ISetDispatcherValueAction{
	type: "SET_DISPATCHER_VALUE",
	payload:string
}

export interface ISetRenameModeAction{
	type: "SET_RENAME_MODE",
	payload: {
		uuid: string,
		on:boolean
	}
}

export interface IRenameDescriptorAction{
	type: "RENAME_DESCRIPTOR",
	payload: {
		uuid: string,
		name:string
	}
}

export interface ISetDescriptorOptionsAction {
	type: "SET_DESCRIPTOR_OPTIONS",
	payload: {
		uuids: string[] | "default"
		options: Partial<IDescriptorSettings>
	}
}

export interface ISetInspectorViewAction {
	type: "SET_INSPECTOR_VIEW_ACTION",
	payload: {
		inspectorType: "content" | "diff" | "code"
		viewType: TGenericViewType | TCodeViewType
	}
}

export interface ISetColumnSizeAction{
	type: "SET_COLUMN_SIZE_ACTION",
	payload: {
		location: "left"|"right"
		value: number
	}
}

export interface ISetRecordRawAction{
	type: "SET_RECORD_RAW",
	payload:boolean
}

export interface ISetMaximumItemsAction{
	type: "SET_MAXIMUM_ITEMS",
	payload:string
}

export interface ISetAutoExpandLevelAction {
	type: "SET_AUTOEXPAND_LEVEL",
	payload: {
		level: number
		part: "DOM" | "content" | "diff"
	}
}

export interface IDontShowMarketplaceInfoAction{
	type: "DONT_SHOW_MARKETPLACE_INFO_ACTION",
	payload:boolean
}


export interface ISetFontSizeAction{
	type: "SET_FONT_SIZE",
	payload: TFontSizeSettings
}

export interface ISetNeverRecordActionNamesAction{
	type: "SET_NEVER_RECORD_ACTION_NAMES_ACTION",
	payload: string[]
}

export interface IToggleDescriptorsGroupingAction{
	type: "TOGGLE_DESCRIPTORS_GROUPING",
	payload: "none" | "strict" | null
}

export interface ISetSettingsAction{
	type: "SET_SETTINGS",
	payload: Partial<ISettings>
}

export function setSettingsAction(settings:Partial<ISettings>): ISetSettingsAction{
	return {
		type: "SET_SETTINGS",
		payload: settings,
	};
}

export function toggleDescriptorsGroupingAction(arg: "none" | "strict" | null = null): IToggleDescriptorsGroupingAction {
	return {
		type: "TOGGLE_DESCRIPTORS_GROUPING",
		payload: arg,
	};
}

export function setNeverRecordActionNamesAction(value: string): ISetNeverRecordActionNamesAction {
	return {
		type: "SET_NEVER_RECORD_ACTION_NAMES_ACTION",
		payload: value.split(/[\n\r]/g).map(v => v.trim()),
	};
}

export function setFontSizeAction(size: TFontSizeSettings):ISetFontSizeAction {
	return {
		type: "SET_FONT_SIZE",
		payload: size,
	};
}

export function setDontShowMarketplaceInfoAction(enabled: boolean): IDontShowMarketplaceInfoAction{
	return {
		type: "DONT_SHOW_MARKETPLACE_INFO_ACTION",
		payload: enabled,
	};
}

export function setAutoExpandLevelAction(part: "DOM" | "content" | "diff",level: number): ISetAutoExpandLevelAction{
	return {
		type: "SET_AUTOEXPAND_LEVEL",
		payload: {
			level,
			part,
		},
	};
}

export function toggleSettingsAction(): IToggleSettingsAction{
	return {
		type: "TOGGLE_SETTINGS",
		payload: null,
	};
}

export function setRecordRawAction(value: boolean): ISetRecordRawAction{
	return {
		type: "SET_RECORD_RAW",
		payload: value,
	};
}

export function setMaximumItems(value: string):ISetMaximumItemsAction {
	return {
		type: "SET_MAXIMUM_ITEMS",
		payload: value,
		
	};
}

export function setColumnSizeAction(px: number, location:"left"|"right"): ISetColumnSizeAction{
	return {
		type: "SET_COLUMN_SIZE_ACTION",
		payload: {
			value: px,
			location,
		},
	};
}

export function setInspectorViewAction(inspectorType:"content" | "diff" | "code", viewType:TGenericViewType|TCodeViewType): ISetInspectorViewAction{
	return {
		type: "SET_INSPECTOR_VIEW_ACTION",
		payload: {
			inspectorType,
			viewType,
		},
	};
}

export function setDescriptorOptionsAction(uuids:string[]|"default",options: Partial<IDescriptorSettings>): ISetDescriptorOptionsAction{
	return {
		type: "SET_DESCRIPTOR_OPTIONS",
		payload: {
			uuids,
			options,
		},
	};
}

export function setRenameModeAction(uuid:string,on:boolean):ISetRenameModeAction{
	return {
		type: "SET_RENAME_MODE",
		payload: {
			on,
			uuid,
		},
	};
}
export function renameDescriptorAction(uuid:string,name:string):IRenameDescriptorAction{
	return {
		type: "RENAME_DESCRIPTOR",
		payload: {
			name,
			uuid,
		},
	};
}

export function setDispatcherValueAction(value:string): ISetDispatcherValueAction{
	return {
		type: "SET_DISPATCHER_VALUE",
		payload:value,
	};
}

export function replaceWholeStateAction(state: IInspectorState):IReplaceWholeState {
	return {
		type: "REPLACE_WHOLE_STATE",
		payload: state,
	};
}

export function setListenerAction(enabled:boolean):IListenerAction{
	return{
		type:"SET_LISTENER",
		payload:enabled,
	};
}
export function setAutoInspectorAction(enabled:boolean):IAutoInspectorAction{
	return{
		type:"SET_AUTO_INSPECTOR",
		payload:enabled,
	};
}

export function setExpandedPathAction(type: ITreeDataTabs,path: TPath, expand: boolean, recursive: boolean,data:any): ISetExpandedPathAction{
	return {
		type: "SET_EXPANDED_PATH",
		payload: {
			type,path, expand, recursive,data,
		},
	};
}

export function setInspectorPathDomAction(path:string[],mode:"replace"|"add"):ISetInspectorPathDOMAction{
	return {
		type: "SET_INSPECTOR_PATH_DOM",
		payload: {
			path,
			mode,
		},
	};
}
export function setInspectorPathDiffAction(path:TPath,mode:"replace"|"add"):ISetInspectorPathDiffAction{
	return {
		type: "SET_INSPECTOR_PATH_DIFF",
		payload: {
			path,
			mode,
		},
	};
}
export function setInspectorPathContentAction(path:string[],mode:"replace"|"add"):ISetInspectorPathContentAction{
	return {
		type: "SET_INSPECTOR_PATH_CONTENT",
		payload: {
			path,
			mode,
		},
	};
}
export function setFilterStateAction(type: TTargetReference,subType: TSubTypes|"main",state: TState): ISetFilterStateAction {
	return {
		type: "SET_FILTER_STATE",
		payload: {
			type, subType, state,
		},
	};
}
export function setModeTabAction(id:TActiveInspectorTab):ISetModeTab{
	return {
		type: "SET_MODE_TAB",
		payload: id,
	};
}
export function setTargetReferenceAction(arg:ITargetReference):ISetTargetReference{
	return {
		type: "SET_TARGET_REFERENCE",
		payload: arg,
	};
}
export function addDescriptorAction(arg:IDescriptor, replace:boolean):IAddDescriptorAction{
	return {
		type: "ADD_DESCRIPTOR",
		payload: {
			arg,
			replace,
		},
	};
}
export function selectDescriptorAction(operation: TSelectDescriptorOperation, uuid?: string,crc?:number): ISelectDescriptor {
	return {
		type: "SELECT_DESCRIPTOR",
		payload: {operation,uuid,crc},
	};
}
export function setSelectedReferenceTypeAction(type: TTargetReference): ISetSelectedReferenceTypeAction {
	return {
		type: "SET_SELECTED_REFERENCE_TYPE_ACTION",
		payload: type,
	};
}

export function clearViewAction(keep:boolean):IClearViewAction{
	return{
		type: "CLEAR_VIEW",
		payload: {keep},
	};
}
export function clearAction():IClearAction{
	return{
		type: "CLEAR",
		payload: null,
	};
}
export function clearNonExistentAction():IClearNonExistentAction{
	return{
		type: "CLEAR_NON_EXISTENT",
		payload: null,
	};
}
export function lockDescAction(lock:boolean,uuids:string[]):ILockDescAction{
	return{
		type: "LOCK_DESC",
		payload: {
			uuids,
			lock,
		},
	};
}
export function pinDescAction(pin:boolean,uuids:string[]):IPinDescAction{
	return{
		type: "PIN_DESC",
		payload: {
			uuids,
			pin,
		},
	};
}
export function removeDescAction(uuids:string[]):IRemoveDescAction{
	return{
		type: "REMOVE_DESC",
		payload: uuids,
	};
}
export function importStateAction(state:IRootState):IImportStateAction{
	return{
		type: "IMPORT_STATE",
		payload: state,
	};
}
export function importItemsAction(items:IDescriptor[],kind:TImportItems):IImportItemsAction{
	return{
		type: "IMPORT_ITEMS",
		payload: {items,kind},
	};
}
export function importReplaceAction():IImportReplaceAction{
	return{
		type: "IMPORT_REPLACE",
		payload: null,
	};
}
export function exportSelectedDescAction():IExportSelectedDescAction{
	return{
		type: "EXPORT_SELECTED_DESC",
		payload: null,
	};
}
export function exportAllDescAction():IExportAllDescAction{
	return{
		type: "EXPORT_ALL_DESC",
		payload: null,
	};
}
export function exportStateAction():IExportStateAction{
	return{
		type: "EXPORT_STATE",
		payload: null,
	};
}

/////////////////

export function setSearchTermAction(str:string|null):ISetSearchTermAction{
	return{
		type: "SET_SEARCH_TERM_ACTION",
		payload: str,
	};
}

export function setListenerNotifierFilterAction(data:Partial<IListenerNotifierFilter>): ISetListenerNotifierAction{
	return {
		type: "SET_LISTENER_NOTIFIER",
		payload: {
			data,
		},
	};
}
/*
export function groupSameAction(enabled: boolean):IGroupSameAction {
	return {
		type: "GROUP_SAME_ACTION",
		payload: enabled,
	};
}*/

export function filterEventNameAction(eventName:string, kind:"include"|"exclude", operation: "add"|"remove"):IFilterEventNameAction {
	return {
		type: "FILTER_EVENT_NAME_ACTION",
		payload: {
			eventName,kind,operation,
		},
	};
}

export function toggleAccordion(id: string, expanded: boolean): IToggleAccordionAction{
	return {
		type: "TOGGLE_ACCORDION",
		payload: {
			id,
			expanded,			
		},
	};
}


export type TActions = 
	IToggleSettingsAction |
	ISetInspectorPathDOMAction |
	ISetModeTab |
	ISetTargetReference |
	IAddDescriptorAction |
	ISelectDescriptor |
	ISetSelectedReferenceTypeAction |
	IClearViewAction |
	IClearAction |
	IClearNonExistentAction |
	ILockDescAction |
	IPinDescAction |
	IRemoveDescAction |
	IImportStateAction |
	IImportItemsAction |
	IExportSelectedDescAction |
	IExportAllDescAction |
	IExportStateAction |
	ISetFilterStateAction |
	ISetInspectorPathDiffAction |
	ISetInspectorPathContentAction |
	ISetExpandedPathAction |
	IListenerAction |
	IAutoInspectorAction |
	ISetSearchTermAction |
	ISetListenerNotifierAction|
	//IGroupSameAction |
	IFilterEventNameAction |
	IReplaceWholeState |
	ISetDispatcherValueAction |
	ISetRenameModeAction |
	IRenameDescriptorAction |
	ISetDescriptorOptionsAction |
	ISetInspectorViewAction |
	ISetColumnSizeAction |
	ISetRecordRawAction |
	ISetAutoExpandLevelAction |
	ISetMaximumItemsAction |
	IDontShowMarketplaceInfoAction |
	ISetFontSizeAction |
	ISetNeverRecordActionNamesAction |
	IToggleDescriptorsGroupingAction |
	ISetSettingsAction |
	IToggleAccordionAction