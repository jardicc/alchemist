import {render} from "react-dom";
import React from "react";
import { Provider } from "react-redux";
import {AppContainer} from "./AppContainer";
import { rootStore } from "../../store";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			"sp-icon": any;
			"sp-button": any;
			"sp-action-button": any;
			"sp-checkbox": any;
			"sp-menu": any;
			"sp-menu-group": any;
			"sp-menu-item": any;
			"sp-menu-divider": any;
			"sp-dropdown": any;
			"sp-radio-group": any;
			"sp-radio": any;
			"sp-search": any;
			"sp-slider": any;
			"sp-switch": any;
			"sp-tab": any;
			"sp-tab-list": any;
			"sp-tags": any;
			"sp-tag": any;
			"sp-textfield": any;
			"sp-tooltip": any;
		}
	}
}

export function renderListenerUI ():void {
	render(
		<Provider store={rootStore}>
			< AppContainer />
		</Provider>,
		document.getElementById("root") as HTMLElement
	);
}