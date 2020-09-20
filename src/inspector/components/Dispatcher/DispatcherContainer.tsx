import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IDispatcherProps, IDispatcherDispatch, Dispatcher } from "./Dispatcher";
import { IRootState } from "../../../shared/store";
import { setDispatcherValueAction, addDescriptorAction } from "../../actions/inspectorActions";
import { getDispatcherSnippet } from "../../selectors/dispatcherSelectors";
import { getInspectorSettings } from "../../selectors/inspectorSelectors";



const mapStateToProps = (state: IRootState): IDispatcherProps => {
	return {
		snippet: getDispatcherSnippet(state),
		settings: getInspectorSettings(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IDispatcherDispatch, Record<string, unknown>> = (dispatch):IDispatcherDispatch => {
	return {
		setDispatcherValue: (value) => dispatch(setDispatcherValueAction(value)),
		onAddDescriptor: (desc) => dispatch(addDescriptorAction(desc)),
	};
};

export const DispatcherContainer = connect<IDispatcherProps, IDispatcherDispatch>(mapStateToProps, mapDispatchToProps)(Dispatcher);