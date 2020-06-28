import { connect, MapDispatchToPropsFunction } from "react-redux";
import {App, IAppProps, IAppDispatch } from "./App";
import { replaceWholeStateAction } from "../actions/actions";
import { Settings } from "../classes/Settings";

const mapDispatchToProps: MapDispatchToPropsFunction<IAppDispatch, Record<string, unknown>> = (dispatch):IAppDispatch => {
	return {
		setWholeState: async () => {
			dispatch(replaceWholeStateAction(await Settings.importState()));
			Settings.loaded = true;
		}
	};
};

export const AppContainer = connect<IAppProps, IAppDispatch>(null, mapDispatchToProps)(App);