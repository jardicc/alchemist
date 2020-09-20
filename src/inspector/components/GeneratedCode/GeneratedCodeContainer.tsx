import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IGeneratedCodeDispatch, IGeneratedCodeProps, GeneratedCode } from "./GeneratedCode";
import { IRootState } from "../../../shared/store";
import { getActiveDescriptorCalculatedReference, getCodeActiveView, getDescriptorOptions } from "../../selectors/inspectorCodeSelectors";
import { getActiveDescriptors, getAutoSelectedUUIDs } from "../../selectors/inspectorSelectors";
import { setDescriptorOptionsAction, setInspectorViewAction } from "../../actions/inspectorActions";


const mapStateToProps = (state: IRootState): IGeneratedCodeProps => {
	return {
		originalReference: getActiveDescriptorCalculatedReference(state),
		selected: getActiveDescriptors(state),
		autoSelectedUUIDs: getAutoSelectedUUIDs(state),
		descriptorSettings: getDescriptorOptions(state),
		viewType: getCodeActiveView(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IGeneratedCodeDispatch, Record<string, unknown>> = (dispatch):IGeneratedCodeDispatch => {
	return {
		onSetOptions: (uuids, options) => dispatch(setDescriptorOptionsAction(uuids, options)),
		onSetView:(viewType) => dispatch(setInspectorViewAction("code",viewType))
	};
};

export const GeneratedCodeContainer = connect<IGeneratedCodeProps, IGeneratedCodeDispatch>(mapStateToProps, mapDispatchToProps)(GeneratedCode);

