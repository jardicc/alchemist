/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type React from "react";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"sp-action-group": any;
			"sp-menu-group": any;
			"sp-split-button": any;
			"sp-popover": any;
			"p-action-group>": any;
			"sp-action-menu": any;
			"sp-search": any;
			"sp-switch": any;
			"sp-tab": any;
			"sp-tab-list": any;
			"sp-tags": any;
			"sp-tag": any;
			"sp-tooltip": any;
		}
	}
}