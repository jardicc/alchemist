import {render} from "react-dom";
import React from "react";
import { Provider } from "react-redux";
import { InspectorContainer } from "./Inspector/InspectorContainer";
import { rootStore } from "../../shared/store";

export function renderInspectorUI(): void {
	setTimeout(() => {
		const el = document.querySelector("[panelid=inspector]");
		if (!el) {
			console.error(el);
		}

		render(
			<Provider store={rootStore}>
				<InspectorContainer  />
			</Provider>, el as HTMLElement
		);
	}, 1000);
}

