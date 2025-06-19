import {createRoot} from "react-dom/client";
import React, {StrictMode} from "react";
import {Provider} from "react-redux";
import {rootStore} from "../../shared/store";
import {ATNDecoderContainer} from "./ATNDecoderContainer/ATNDecoderContainer";
import {ErrorBoundary} from "../../inspector/components/ErrorBoundary";

export function renderATNDecoderUI(): void {
	const el = document.querySelector("[panelid=occultist]");
	if (!el) {
		console.error(el);
		throw new Error("ATNDecoder element not found in the DOM.");
	}

	const rootElement = createRoot(el);

	rootElement.render(
		//<StrictMode>
			<Provider store={rootStore}>
				<ErrorBoundary>
					<ATNDecoderContainer />
				</ErrorBoundary>
			</Provider>
		//</StrictMode>
	);
}