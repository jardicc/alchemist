import { TActiveInspectorTab, TActiveSection, IDescriptor, TSelectDescriptorOperation, TActiveTargetReferenceArr, TTargetReference } from "../reducers/initialStateInspector";

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


export type TActions = ISetMainTab |
	ISetModeTab |
	ISetTargetReference |
	IAddDescriptorAction |
	ISelectDescriptor |
	ISetSelectedReferenceTypeAction