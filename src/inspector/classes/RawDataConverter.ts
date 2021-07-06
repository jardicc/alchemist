import { Descriptor } from "photoshop/dist/types/UXP";
import { Store, CombinedState, AnyAction } from "redux";
import { IDescriptorSettings, IInspectorState } from "../model/types";
import { getDescriptorOptions } from "../selectors/inspectorCodeSelectors";
import { getInspectorSettings } from "../selectors/inspectorSelectors";
import { Base64} from "./Base64";

export class RawDataConverter{

	public static arrayBufferToString(arr: ArrayBuffer): string {
		let binary = "";
		const bytes = new Uint8Array( arr );
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

	public static convertFakeRawInCode(obj: Descriptor,descSettings:IDescriptorSettings): void{
		//const store:Store<CombinedState<{inspector: IInspectorState;}>, AnyAction> = (window as any)._rootStore;
		rec(obj);

		function rec(data:Descriptor) {
			for (const key in data) {
				if (Object.prototype.hasOwnProperty.call(data, key)) {
					const itemInData = data[key];
					//if (key === "profile") debugger;
					if (Array.isArray(itemInData)) {
						for (let i = 0; i < itemInData.length; i++) {
							const element = itemInData[i];
							rec(element);
						}
					}
					else if (itemInData instanceof ArrayBuffer && descSettings.supportRawDataType === true) {
						console.log("Buf Buf!!!");
						const str = RawDataConverter.arrayBufferToString(itemInData);
						data[key] = {
							"_rawData": "base64",
							"_data": Base64.btoa(str),
						};
					} else if (typeof itemInData === "object") {
						if ("_rawData" in itemInData && itemInData._rawData === "alchemistFakeType") {
							// $$$ adds marker so we can find them later and remove left and right quotes from string
							//itemInData = `$$$Left_new Uint8Array(${JSON.stringify(itemInData._data)})_Right$$$`;
							const str = RawDataConverter.arrayCodeToString(itemInData._data);
							data[key] = {
								"_rawData": "base64",
								"_data": Base64.btoa(str),
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