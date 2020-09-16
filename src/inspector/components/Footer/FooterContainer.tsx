import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IFooterProps, IFooterDispatch } from "./Footer";
import {Footer} from "./Footer";
import { IRootState } from "../../../shared/store";
import { clearAction, clearViewAction, importItemsAction, importStateAction } from "../../actions/inspectorActions";
import { getDescriptorsListView, getAllDescriptors, getSelectedDescriptors } from "../../selectors/inspectorSelectors";

interface IOwn{
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IFooterProps => {
	return {
		wholeState: state,
		viewItems: getDescriptorsListView(state),
		allItems: getAllDescriptors(state),
		selectedItems: getSelectedDescriptors(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IFooterDispatch, IOwn> = (dispatch): IFooterDispatch => {
	return {
		onClear: () => dispatch(clearAction()),
		onClearView: (keep) => dispatch(clearViewAction(keep)),
		importItems:(items,kind)=>dispatch(importItemsAction(items,kind)),
		setWholeState: (state) => dispatch(importStateAction(state)),
		onClearNonExistent:(items)=>dispatch(importItemsAction(items,"replace"))
	};
};

export const FooterContainer = connect<IFooterProps, IFooterDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(Footer);