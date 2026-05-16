
import {createRoot} from "react-dom/client";
import React, {StrictMode} from "react";
import {Provider} from "react-redux";
import {Inspector} from "./InspectorContainer";
import {rootStore} from "../../shared/store";
import {ErrorBoundary} from "./ErrorBoundary";
import {NotificationContainer} from "react-notifications";
import "../styleOverrides/notifications.less";




export function renderInspectorUI(): void {
	const element = document.querySelector("[panelid=inspector]");
	if (!element) {
		console.error(element);
		throw new Error("Inspector element not found in the DOM.");
	}

	const rootElement = createRoot(element);

	rootElement.render(
		//<StrictMode>
			<Provider store={rootStore}>
				<ErrorBoundary>
					<NotificationContainer />
					<Inspector />
				</ErrorBoundary>
			</Provider>
		//</StrictMode>
	);
}