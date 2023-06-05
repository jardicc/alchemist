import {ActionDescriptor} from "photoshop/dom/CoreModules";
import {IHarvestersList} from "./harvester-types";
import {Harvester} from "./Harvester";
import {cloneDeep} from "lodash";
import fs from "fs";
import {uxp} from "../types/uxp";
import {harvest} from "./Harvest";
import {HarvesterFS} from "./HarvesterFS";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localFileSystem: uxp.storage.LocalFileSystemProvider = require("uxp").storage.localFileSystem;

export class HarvesterControl {

	private harvestersList: IHarvestersList = {};

	constructor() {
		//
	}

	public get saveFolderPath() {
		return "plugin-data:/harvester/";
	}

	public async getSaveFolder():Promise<uxp.storage.Folder> {
		const folder:uxp.storage.Folder = await (localFileSystem as any).getEntryWithUrl(this.saveFolderPath);
		return folder;
	}

	public disposeHarvester(eventName: string) {
		delete this.harvestersList[eventName];
	}

	private async initialize(descriptor: ActionDescriptor) {
		if (!this.harvestersList[descriptor._obj]) {
			const harvester = new HarvesterFS(descriptor._obj, this);
			await harvester.loadStack();
			this.harvestersList[descriptor._obj] = harvester;
		}
		const harvester = this.harvestersList[descriptor._obj];
		harvester.add(descriptor);
	}

	public async addDescriptor(descriptor: ActionDescriptor) {
		const cloned = cloneDeep(descriptor);
		await this.initialize(cloned);
	}

	public async makeFolder() {
		try {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await fs.mkdir(this.saveFolderPath, {recursive: true});			
		} catch (e) {
			console.warn(e);
		}
	}

	public async listAllFiles():Promise<uxp.storage.File[]> {
		const folder = await this.getSaveFolder();
		const files = (await folder.getEntries()).filter(f => f.isFile) as uxp.storage.File[];
		return files;
	}
}

export const harvesterControl = new HarvesterControl();

(window as any).hc = harvesterControl;
(window as any).hv = harvest;