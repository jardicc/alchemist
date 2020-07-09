import {render} from "react-dom";
import React from "react";
import { Provider } from "react-redux";
import {AppContainer} from "./AppContainer";
import { rootStore } from "../../shared/store";

export function renderListenerUI ():void {
	render(
		<Provider store={rootStore}>
			< AppContainer />
		</Provider>,
		document.getElementById("root") as HTMLElement
	);
}