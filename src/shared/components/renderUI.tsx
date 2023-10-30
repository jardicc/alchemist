import { Root, createRoot } from 'react-dom/client';
import React from "react";
import { Provider } from "react-redux";
import { rootStore } from "../../shared/store";
import "../../inspector/styleOverrides/notifications.less";
import {UxpPanel} from "../../inspector/components/UxpPanel/UxpPanel";
import {SorcererContainer} from "../../sorcerer/components/SorcererContainer/SorcererContainer";
import {ATNDecoderContainer} from "../../atnDecoder/components/ATNDecoderContainer/ATNDecoderContainer";
import {InspectorContainer} from "../../inspector/components/Inspector/InspectorContainer";

// SWC
import {Theme} from "@swc-react/theme";
import "@spectrum-web-components/theme/theme-dark.js";
//import "@spectrum-web-components/theme/express/theme-dark.js";
import "@spectrum-web-components/theme/scale-medium.js";
//import "@spectrum-web-components/theme/scale-large.js";
//import "@spectrum-web-components/theme/express/scale-medium.js";
//import "@spectrum-web-components/theme/express/scale-large.js";

export function renderUI(): Root {
	const uiWrapper = document.body.querySelector("#ui");

	if (!uiWrapper) {
		throw new Error("UI wrapper not found");
	}

	const root = createRoot(uiWrapper);

	root.render(
		<Provider store={rootStore}>
			<Theme theme="spectrum" scale="medium" color="dark" >
				<UxpPanel panelId="inspector" className="Inspector">
					<InspectorContainer />
				</UxpPanel>
				<UxpPanel panelId="occultist" className="Occultist">
					<ATNDecoderContainer />
				</UxpPanel>
				<UxpPanel panelId="sorcerer" className="Sorcerer">
					<SorcererContainer />
				</UxpPanel>
			</Theme>
		</Provider>
	);

	return root;
}

