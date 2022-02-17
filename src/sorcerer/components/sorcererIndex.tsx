import {render} from "react-dom";
import React from "react";
import { Provider } from "react-redux";
import { rootStore } from "../../shared/store";
import { ErrorBoundary } from "../../inspector/components/ErrorBoundary/ErrorBoundary";
import { SorcererContainer } from "./SorcererContainer/SorcererContainer";

export function renderSorcererUI(): void {
	const el = document.querySelector("[panelid=sorcerer]");
	if (!el) {
		console.error(el);
	}

	render(
		<Provider store={rootStore}>
			<ErrorBoundary>
				<SorcererContainer />
			</ErrorBoundary>
		</Provider>, el as HTMLElement,
	);
}