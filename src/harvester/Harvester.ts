import {ActionDescriptor} from "photoshop/dom/CoreModules";
import crc from "crc-32";

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const fs = require("fs");
import fs from "fs";
import {IFileContent} from "./harvester-types";
import {HarvesterControl} from "./HarvesterControl";

export class Harvester{

	protected eventName: string;
	protected stack!: IFileContent;
	protected parent: HarvesterControl;

	constructor(eventName:string, parent:HarvesterControl) {
		this.eventName = eventName;		
		this.parent = parent;
	}

	protected get saveFilePath() {
		return `${this.parent.saveFolderPath}${this.eventName}.json`;
	}

	public loadStack = async () => {
		try {
			this.stack = await this.readFile();			
		} catch (e) {
			console.warn(e);
			this.stack = {};
		}
	};

	public async recursion(cb: (property:string|number, value:any, data:any, output:any) => Promise<void>, output={}) {
		const rec = async (data: any) => {
			for (const property in data) {
				if (Object.prototype.hasOwnProperty.call(data, property)) {
					const value = data[property];
					await cb(property, value, data, output);

					if (typeof data[property] == "object") {
						await rec(value);
					}
				}
			}
		};
		await rec(this.stack);
	}

	protected async readFile(): Promise<IFileContent> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const data: any = await fs.readFile(this.saveFilePath, {encoding: "utf-8"});
		const content: IFileContent = JSON.parse(data);
		return content;
	}

	protected async writeFile(data: IFileContent): Promise<void>{
		const content = JSON.stringify(data, null, 2);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await fs.writeFile(this.saveFilePath, content, {encoding: "utf-8"});
	}

	protected stripData(data: ActionDescriptor): void {
		for (const property in data) {
			if (Object.prototype.hasOwnProperty.call(data, property)) {
				const value = data[property];

				if (property === "documentID" && typeof value === "number") {
					data[property] = 1;
				}
				else if (property === "layerID" && typeof value === "number") {
					data[property] = 1;
				}
				else if (property === "layerID" && Array.isArray(value)) {
					data[property] = [1];
				}
				else if (property === "name" && typeof value === "string") {
					data[property] = "dummy name";
				}
				else if (property === "_name" && typeof value === "string") {
					data[property] = "dummy name";
				}
				else if (property === "_path" && typeof value === "string") {
					data[property] = "dummy path";
				}
				else if (property === "_data" && typeof value === "string") {
					data[property] = "dummy base64";
				}
				else if (value instanceof ArrayBuffer) {
					data[property] = "stripped ArrayBuffer";
				}
				else if (property === "notifyPlayLevel" && typeof value === "number") {
					delete data[property];
				}
				else if (property === "_isCommand") {
					delete data[property];
				}
				// recursion here
				else if (typeof data[property] == "object") {
					this.stripData(data[property]);
				}
			}
		}
	}

	protected getCrc(data: ActionDescriptor):number {
		return crc.str(JSON.stringify(data));
	}
}