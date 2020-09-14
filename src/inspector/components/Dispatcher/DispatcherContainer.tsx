import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IDispatcherProps, IDispatcherDispatch, Dispatcher } from "./Dispatcher";
import { getDispatcherSnippet } from "../../selectors/inspectorSelectors";
import { IRootState } from "../../../shared/store";
import { setDispatcherValueAction, addDescriptorAction } from "../../actions/inspectorActions";



const mapStateToProps = (state: IRootState): IDispatcherProps => {
	return {
		snippet:getDispatcherSnippet(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IDispatcherDispatch, Record<string, unknown>> = (dispatch):IDispatcherDispatch => {
	return {
		setDispatcherValue: (value) => dispatch(setDispatcherValueAction(value)),
		onAddDescriptor: (desc) => dispatch(addDescriptorAction(desc)),
	};
};

export const DispatcherContainer = connect<IDispatcherProps, IDispatcherDispatch>(mapStateToProps, mapDispatchToProps)(Dispatcher);