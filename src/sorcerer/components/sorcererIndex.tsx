import {createRoot} from "react-dom/client";
import React, {StrictMode} from "react";
import {Provider} from "react-redux";
import {rootStore} from "../../shared/store";
import {ErrorBoundary} from "../../inspector/components/ErrorBoundary";
import {Sorcerer} from "./SorcererContainer";

export function renderSorcererUI(): void {
	const el = document.querySelector("[panelid=sorcerer]");
	if (!el) {
		console.error(el);
		throw new Error("Sorcerer element not found in the DOM.");
	}

	const rootElement = createRoot(el);

	rootElement.render(
		//<StrictMode>
			<Provider store={rootStore}>
				<ErrorBoundary>
					<Sorcerer />
				</ErrorBoundary>
			</Provider>
		//</StrictMode>
	);
}