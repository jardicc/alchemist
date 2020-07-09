import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IFooterProps, IFooterDispatch } from "./Footer";
import {Footer} from "./Footer";
import { IRootState } from "../../../shared/store";
import { clearAction } from "../../actions/inspectorActions";
import { IDescriptor } from "../../model/types";

interface IOwn{
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IFooterProps => {
	return {

	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IFooterDispatch, IOwn> = (dispatch): IFooterDispatch => {
	return {
		onClear: () => dispatch(clearAction())
	};
};

export const FooterContainer = connect<IFooterProps, IFooterDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(Footer);