import { TActiveInspectorTab, TActiveSection, ITargetReference, IDescriptor, TSelectDescriptorOperation } from "../reducers/initialStateInspector";

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
	payload: ITargetReference
}

export interface IAddDescriptorAction {
	type: "ADD_DESCRIPTOR"
	payload: IDescriptor
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
export function setTargetReferenceAction(arg:ITargetReference):ISetTargetReference{
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



export type TActions = ISetMainTab |
	ISetModeTab |
	ISetTargetReference |
	IAddDescriptorAction |
	ISelectDescriptor