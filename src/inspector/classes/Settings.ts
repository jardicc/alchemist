import { IDescriptor, TFontSizeSettings } from "../model/types";
import { alert } from "./Helpers";
import type {uxp} from "../types/uxp";
import { SpectrumComponetDefaults } from "react-uxp-spectrum";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localFileSystem:uxp.storage.LocalFileSystemProvider = require("uxp").storage.localFileSystem;

export class Settings{

	public static loaded = false;

	private static readonly settingsFilename = "settings.json";
	private static saveTimeout: number;

	public static async reset():Promise<void> {
		try {
			const folder = await Settings.settingsFolder();
			const entry = await folder.getEntry(Settings.settingsFilename);
		
			if (!entry.isFile) {
				return;
			}
			await entry.delete();
			location.reload();
		} catch (e) {
			console.error("Error - settings reset failed!");
		}
	}

	public static async settingsFolder():Promise<uxp.storage.Folder> {
		const folder = await localFileSystem.getDataFolder();
		return folder;
	}

	public static async saveSettings(object: any): Promise<void> {
		clearTimeout(Settings.saveTimeout);
		Settings.saveTimeout = window.setTimeout(async () => {
			const folder = await Settings.settingsFolder();
			console.log(folder);
			await Settings._saveSettings(object, folder);
			console.log("saved");
		}, 10 * 1000);
	}

	private static getTimeStamp() {
		const time = new Date();
		const name = time.toLocaleString("uk").replace(/:/gm, "-").replace(",", "");
		return name;
	}

	public static async exportDescriptorItems(descriptors: IDescriptor[]): Promise<void> {
		if (!descriptors.length) {
			await alert("There are no descriptors to export");
			return;
		}
		const file = await localFileSystem.getFileForSaving("Descriptor items " + Settings.getTimeStamp() + ".json", {
			types: ["json"],
		});
		if (!file) {
			await alert("There was a problem with file");
			return;
		}
		const data = JSON.stringify(descriptors, null, "\t");
		await file.write(data, {
			append: false,
		});
	}

	public static async saveSettingsWithDialog(object: any): Promise<void> {
		const file = await localFileSystem.getFileForSaving("Alchemist state " + Settings.getTimeStamp() + ".json", {
			types: ["json"],
		});
		if (!file) {
			await alert("There was a problem with file");
			return;
		}
		const data = JSON.stringify(object, null, "\t");
		await file.write(data, {
			append: false,
		});
	}

	private static async _saveSettings(object: any, folder: any): Promise<void>{
		if (!Settings.loaded) {
			return;
		}

		const data = JSON.stringify(object, null, "\t");
		//console.log(folder);
		const created = await folder.createFile(Settings.settingsFilename, {
			overwrite: true,
		});
		await created.write(data, {
			append: false,
		});
	}

	public static async importState(): Promise<any | null> {
		const folder = await Settings.settingsFolder();
		let entry: any;
		try {
			entry = await folder.getEntry(Settings.settingsFilename);
		
			if (!entry.isFile) {
				return null;
			}
			const data: string = await entry.read();
			const result = JSON.parse(data);
			Settings.setSpectrumComponentSize(result.settings.fontSize);

			return result;
		} catch (e) {
			console.log("Error - with reading of settings!");
			await folder.createFile(Settings.settingsFilename, {
				overwrite: true,
			});
			return null;
		}
	}

	public static setSpectrumComponentSize(fontSize:TFontSizeSettings):void {
		switch (fontSize) {
			case "size-tiny":SpectrumComponetDefaults.defaultSize = "s";
				break;
			case "size-small":SpectrumComponetDefaults.defaultSize = "s";
				break;
			case "size-default":SpectrumComponetDefaults.defaultSize = "s";
				break;
			case "size-bigger":SpectrumComponetDefaults.defaultSize = "m";
				break;
			case "size-big":SpectrumComponetDefaults.defaultSize = "m";
				break;
			case "size-youMustBeJoking":SpectrumComponetDefaults.defaultSize = "xl";
				break;
				
		}
	}

	public static async importStateWithDialog(): Promise<any|null>{
		const files = await localFileSystem.getFileForOpening({
			types: ["json"],
			allowMultiple: true,
			//initialLocation: await Settings.settingsFolder()
		});
		if (!files || !files.length) {
			return null;
		}
		const data: string = await files[0].read();
		try {
			const result = JSON.parse(data);
			return result;
		} catch (e) {
			console.log("Error - with reading of settings!");
			return null;
		}
	}
}