
import {action, app} from "photoshop";
import {ActionDescriptor} from "photoshop/dom/CoreModules";
import {TChannelReferenceValid, DocumentMode} from "../model/types";


export class IDBySelected {

	// "action" can be used to get target actions and commands but not the sets. We skip it here.

	public static async channel(docID?: number): Promise<number | null | TChannelReferenceValid> {

		const resultItemIndex = await this.getProperty("itemIndex", "channel", docID);
		if ("itemIndex" in resultItemIndex) {
			return resultItemIndex.itemIndex as number;
		}

		const itemIndex = (await this.getProperty("itemIndex", "channel", docID)).itemIndex;
		const mode = await this.getActiveDocumentColorMode(docID);
		switch (mode) {
			case DocumentMode.CMYK:
				switch (itemIndex) {
					case 1: return "cyan";
					case 2: return "magenta";
					case 3: return "yellow";
					case 4: return "black";
				}
				break;
			case DocumentMode.RGB:
				switch (itemIndex) {
					case 1: return "red";
					case 2: return "green";
					case 3: return "blue";
				}
				break;
			case DocumentMode.LAB:
				switch (itemIndex) {
					case 1: return "lightness";
					case 2: return "a";
					case 3: return "b";
				}
				break;
			case DocumentMode.GRAYSCALE:
				switch (itemIndex) {
					case 1: return "gray";
				}
				break;
			default:
				return "RGB"; // can we return composite channel instead?

		}
		return "RGB"; // can we return composite channel instead?
	}

	public static async history(): Promise<number | null> {
		const result = await this.getProperty("ID", "historyState");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	public static async snapshot(): Promise<number | null> {
		const result = await this.getProperty("ID", "snapshotClass");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	public static async path(docID?: number): Promise<"vectorMask" | "workPath" | number | null> {
		const pathKind = (await this.getProperty("kind", "path", docID)).kind._value;
		if (pathKind === "workPathIndex") {
			return "workPath";
		}
		if (pathKind === "vectorMask") {
			return "vectorMask";
		}
		const result = await this.getProperty("ID", "path");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	public static async layer(docID?: number): Promise<number | null> {
		const result = await this.getProperty("layerID", "layer", docID);
		if ("layerID" in result) {
			return result.layerID as number;
		}
		return null;
	}


	private static getActiveDocumentColorMode(docID?: number): DocumentMode {
		if (typeof docID === "number") {
			const doc = new app.Document(docID);
			return doc.mode as any;
		} else {
			return app.activeDocument.mode as any;
		}
	}

	public static async getProperty(
		property: string,
		myClass: "channel" | "document" | "guide" | "historyState" | "snapshotClass" | "layer" | "path",
		docID?: number,
	): Promise<ActionDescriptor> {
		const desc: ActionDescriptor = {
			_obj: "get",
			_target: [
				{
					_property: property,
				},
				{
					_ref: myClass as string,
					_enum: "ordinal",
					_value: "targetEnum",
				},
			],
		};

		if (typeof docID === "number") {
			desc._target.push({
				_ref: "document",
				_id: docID,
			});
		}

		const result = await action.batchPlay([
			desc,
		], {});
		return result[0];
	}
}