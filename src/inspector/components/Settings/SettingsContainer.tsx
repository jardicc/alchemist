import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ISettingsDispatch, ISettingsProps, Settings } from "./Settings";
import { IRootState } from "../../../shared/store";
import { getInspectorSettings } from "../../selectors/inspectorSelectors";
import { setRecordRawAction } from "../../actions/inspectorActions";


const mapStateToProps = (state: IRootState): ISettingsProps => {
	return {
		settings: getInspectorSettings(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ISettingsDispatch, Record<string, unknown>> = (dispatch):ISettingsDispatch => {
	return {
		onSetRecordRaw:(value)=>dispatch(setRecordRawAction(value))
	};
};

export const SettingsContainer = connect<ISettingsProps, ISettingsDispatch>(mapStateToProps, mapDispatchToProps)(Settings);

