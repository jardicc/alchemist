import { TActiveSection, TActiveInspectorTab, TActiveTargetReferenceArr, IDescriptor, TTargetReference, TSelectDescriptorOperation } from "../model/types";

export interface ISetMainTab {
	type: "SET_MAIN_TAB"
	payload: TActiveSection
}

export interface ISetModeTab {
	type: "SET_MODE_TAB"
	payload: TActiveInspectorTab
}

export interface ISetTargetReference {
	type: "SET_TARGET_REFERENCE"
	payload: TActiveTargetReferenceArr
}

export interface IAddDescriptorAction {
	type: "ADD_DESCRIPTOR"
	payload: IDescriptor
}

export interface ISetSelectedReferenceTypeAction {
	type: "SET_SELECTED_REFERENCE_TYPE_ACTION"
	payload: TTargetReference
}

export interface ISelectDescriptor {
	type: "SELECT_DESCRIPTOR"
	payload: {
		operation:TSelectDescriptorOperation
		uuid:string
	}
}

export interface IClearViewAction{
	type: "CLEAR_VIEW"
	payload:null
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
	payload:null
}
export interface IImportAppendAction{
	type: "IMPORT_APPEND"
	payload:null
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

export function setMainTabAction(id:TActiveSection):ISetMainTab{
	return {
		type: "SET_MAIN_TAB",
		payload: id
	};
}
export function setModeTabAction(id:TActiveInspectorTab):ISetModeTab{
	return {
		type: "SET_MODE_TAB",
		payload: id
	};
}
export function setTargetReferenceAction(arg:TActiveTargetReferenceArr):ISetTargetReference{
	return {
		type: "SET_TARGET_REFERENCE",
		payload: arg
	};
}
export function addDescriptorAction(arg:IDescriptor):IAddDescriptorAction{
	return {
		type: "ADD_DESCRIPTOR",
		payload: arg
	};
}
export function selectDescriptorAction(operation: TSelectDescriptorOperation, uuid: string): ISelectDescriptor {
	return {
		type: "SELECT_DESCRIPTOR",
		payload: {operation,uuid}
	};
}
export function setSelectedReferenceTypeAction(type: TTargetReference): ISetSelectedReferenceTypeAction {
	return {
		type: "SET_SELECTED_REFERENCE_TYPE_ACTION",
		payload: type
	};
}

export function clearViewAction():IClearViewAction{
	return{
		type: "CLEAR_VIEW",
		payload: null
	};
}
export function clearAction():IClearAction{
	return{
		type: "CLEAR",
		payload: null
	};
}
export function clearNonExistentAction():IClearNonExistentAction{
	return{
		type: "CLEAR_NON_EXISTENT",
		payload: null
	};
}
export function lockDescAction(lock:boolean,uuids:string[]):ILockDescAction{
	return{
		type: "LOCK_DESC",
		payload: {
			uuids,
			lock
		}
	};
}
export function pinDescAction(pin:boolean,uuids:string[]):IPinDescAction{
	return{
		type: "PIN_DESC",
		payload: {
			uuids,
			pin
		}
	};
}
export function removeDescAction(uuids:string[]):IRemoveDescAction{
	return{
		type: "REMOVE_DESC",
		payload: uuids
	};
}
export function importStateAction():IImportStateAction{
	return{
		type: "IMPORT_STATE",
		payload: null
	};
}
export function importAppendAction():IImportAppendAction{
	return{
		type: "IMPORT_APPEND",
		payload: null
	};
}
export function importReplaceAction():IImportReplaceAction{
	return{
		type: "IMPORT_REPLACE",
		payload: null
	};
}
export function exportSelectedDescAction():IExportSelectedDescAction{
	return{
		type: "EXPORT_SELECTED_DESC",
		payload: null
	};
}
export function exportAllDescAction():IExportAllDescAction{
	return{
		type: "EXPORT_ALL_DESC",
		payload: null
	};
}
export function exportStateAction():IExportStateAction{
	return{
		type: "EXPORT_STATE",
		payload: null
	};
}


export type TActions = ISetMainTab |
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
	IImportAppendAction |
	IImportReplaceAction |
	IExportSelectedDescAction |
	IExportAllDescAction |
	IExportStateAction