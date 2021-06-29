import { Descriptor } from "photoshop/dist/types/UXP";
import { Store, CombinedState, AnyAction } from "redux";
import { IInspectorState } from "../model/types";
import { getInspectorSettings } from "../selectors/inspectorSelectors";
require("./Base64.js");

export class RawDataConverter{
	public static replaceArrayBuffer(obj: Descriptor): Descriptor {
		const store:Store<CombinedState<{inspector: IInspectorState;}>, AnyAction> = (window as any)._rootStore;
		const settings = getInspectorSettings(store.getState());
		if (!settings.makeRawDataEasyToInspect) {
			return obj;
		}
		rec(obj);
		return obj;

		function rec(data:Descriptor) {
			for (const key in data) {
				if (Object.prototype.hasOwnProperty.call(data, key)) {
					if (Array.isArray(data)) {
						for (const item of data) {
							rec(item);
						}
					}
					else if (data[key] instanceof ArrayBuffer) {
						const uint = new Uint8Array(data[key]);
						const arr: number[] = Array.from(uint);

						if (settings.makeRawDataEasyToInspect) {
							data[key] = {
								"_data": arr,
								"_rawData": "alchemistFakeType",
							};							
						} else {
							data[key] = "<ArrayBuffer> This value was ignored for performance reasons. Turn this on in Alchemist > Settings > Support raw data type";
						}
					}
					else if (typeof data[key] === "object") {
						rec(data[key]);
					}
				}				
			}
		}
	}

	public static convertFakeRawInCode(obj: Descriptor): void{
		const store:Store<CombinedState<{inspector: IInspectorState;}>, AnyAction> = (window as any)._rootStore;
		const settings = getInspectorSettings(store.getState());
		rec(obj);

		function rec(data:Descriptor) {
			for (const key in data) {
				if (Object.prototype.hasOwnProperty.call(data, key)) {
					if (Array.isArray(data)) {
						for (const item of data) {
							rec(item);
						}
					}
					else if (data[key] instanceof ArrayBuffer) {
						console.log("Buf Buf!!!");
						data[key] = {
							"_rawData": "base64",
							"_data": btoa(String.fromCharCode(...new Uint8Array(data[key]))),
						};
					} else if (typeof data[key] === "object") {
						if ("_rawData" in data[key] && data[key]._rawData === "alchemistFakeType") {
							// $$$ adds marker so we can find them later and remove left and right quotes from string
							data[key] = `$$$Left_new Uint8Array(${JSON.stringify(data[key]._data)})_Right$$$`;
						} else {
							rec(data[key]);							
						}
					}
				}				
			}
		}
	}
}