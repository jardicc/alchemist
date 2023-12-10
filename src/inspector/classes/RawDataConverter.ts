
import {ActionDescriptor} from "photoshop/dom/CoreModules";
import {IDescriptorSettings} from "../model/types";
import {getInspectorSettings} from "../selectors/inspectorSelectors";

export class RawDataConverter {

	public static arrayBufferToString(arr: ArrayBuffer): string {
		let binary = "";
		const bytes = new Uint8Array(arr);
		for (let i = 0, len = bytes.byteLength; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return binary;
	}

	public static arrayCodeToString(arr: number[]): string {
		let binary = "";
		for (let i = 0, len = arr.length; i < len; i++) {
			binary += String.fromCharCode(arr[i]);
		}
		return binary;
	}

	public static replaceArrayBuffer(obj: ActionDescriptor[] | ActionDescriptor): ActionDescriptor[] | ActionDescriptor {
		const store = window._rootStore;
		const settings = getInspectorSettings(store.getState());
		if (!settings.makeRawDataEasyToInspect) {
			return obj;
		}
		rec(obj);
		return obj;

		function rec(data: any) {
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
								"_rawData": "alchemistFakeType",
								"_data": arr,
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

	public static convertFakeRawInCode(obj: ActionDescriptor, descSettings: IDescriptorSettings): void {
		rec(obj);

		function rec(data: ActionDescriptor) {
			for (const key in data) {
				if (Object.prototype.hasOwnProperty.call(data, key)) {
					const itemInData = data[key];
					if (Array.isArray(itemInData)) {
						for (let i = 0; i < itemInData.length; i++) {
							const element = itemInData[i];
							rec(element);
						}
					}
					else if (itemInData instanceof ArrayBuffer && descSettings.supportRawDataType === true) {
						const str = RawDataConverter.arrayBufferToString(itemInData);
						data[key] = {
							"_rawData": "base64",
							"_data": btoa(str),
						};
					} else if (typeof itemInData === "object") {
						if ("_rawData" in itemInData && itemInData._rawData === "alchemistFakeType") {
							const str = RawDataConverter.arrayCodeToString(itemInData._data);
							data[key] = {
								"_rawData": "base64",
								"_data": btoa(str),
							};
						} else {
							rec(itemInData);
						}
					}
				}
			}
		}
	}
}