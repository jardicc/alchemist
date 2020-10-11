import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IInspectorDispatch, IInspectorProps, Inspector } from "./Inspector";
import { setMainTabAction, setModeTabAction, replaceWholeStateAction, setColumnSizeAction } from "../../actions/inspectorActions";
import { IRootState } from "../../../shared/store";
import { Settings } from "../../classes/Settings";
import { getMainTabID, getModeTabID, getActiveDescriptorOriginalReference } from "../../selectors/inspectorSelectors";


const mapStateToProps = (state: IRootState): IInspectorProps => {
	return {
		mainTab: getMainTabID(state),
		modeTab: getModeTabID(state),
		calculatedReference: getActiveDescriptorOriginalReference(state),
		columnSizesPercentage: [0,0] //getColumnSizesPercentage(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IInspectorDispatch, Record<string, unknown>> = (dispatch):IInspectorDispatch => {
	return {
		setMainTab: (key) => dispatch(setMainTabAction(key)),
		setModeTab: (key) => dispatch(setModeTabAction(key)),
		setWholeState: async () => {
			dispatch(replaceWholeStateAction(await Settings.importState()));
			Settings.loaded = true;
		},
		setColumnSize:(px)=>dispatch(setColumnSizeAction(px)),
	};
};

export const InspectorContainer = connect<IInspectorProps, IInspectorDispatch>(mapStateToProps, mapDispatchToProps)(Inspector);