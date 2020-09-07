import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IInspectorDispatch, IInspectorProps, Inspector } from "./Inspector";
import { setMainTabAction, setModeTabAction, replaceWholeStateAction } from "../../actions/inspectorActions";
import { getMainTabID, getModeTabID, getActiveDescriptorContent, getActiveDescriptorCalculatedReference, getActiveDescriptorOriginalReference, getRightRawDiff, getLeftRawDiff } from "../../selectors/inspectorSelectors";
import { IRootState } from "../../../shared/store";
import { Settings } from "../../../listener/classes/Settings";


const mapStateToProps = (state: IRootState): IInspectorProps => {
	return {
		mainTab: getMainTabID(state),
		modeTab: getModeTabID(state),
		descriptorContent:getActiveDescriptorContent(state),
		originalReference: getActiveDescriptorCalculatedReference(state),
		calculatedReference: getActiveDescriptorOriginalReference(state),
		rightRawDiff: getRightRawDiff(state),
		leftRawDiff: getLeftRawDiff(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IInspectorDispatch, Record<string, unknown>> = (dispatch):IInspectorDispatch => {
	return {
		setMainTab: (key) => dispatch(setMainTabAction(key)),
		setModeTab: (key) => dispatch(setModeTabAction(key)),
		setWholeState: async () => {
			dispatch(replaceWholeStateAction(await Settings.importState()));
			Settings.loaded = true;
		}
	};
};

export const InspectorContainer = connect<IInspectorProps, IInspectorDispatch>(mapStateToProps, mapDispatchToProps)(Inspector);