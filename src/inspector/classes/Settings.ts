// eslint-disable-next-line @typescript-eslint/no-var-requires
const localFileSystem = require("uxp").storage.localFileSystem;

export class Settings{

	public static loaded = false;

	private static readonly settingsFilename = "settings.json";
	private static saveTimeout: number;

	public static async settingsFolder() {
		const folder = await localFileSystem.getDataFolder();
		return folder;
	}

	public static async saveSettings(object: any): Promise<void> {
		clearTimeout(this.saveTimeout);
		this.saveTimeout = setTimeout(async () => {
			const folder = await this.settingsFolder();
			console.log(folder);
			await this._saveSettings(object, folder);
			console.log("saved");
		}, 10 * 1000);
	}

	private static getTimeStamp() {
		const time = new Date();
		const name = time.toLocaleString("uk").replace(/:/gm, "-").replace(",", "");
		return name;
	}

	public static async saveSettingsWithDialog(object: any): Promise<void> {
		const file = await localFileSystem.getFileForSaving("Alchemist state " + this.getTimeStamp() + ".json", {
			types: ["json"],
			//initialLocation: await this.settingsFolder()
		});
		if (!file) {
			return;
		}
		const data = JSON.stringify(object, null, "\t");
		await file.write(data, {
			append: false
		});
	}

	private static async _saveSettings(object: any, folder: any): Promise<void>{
		if (!this.loaded) {
			return;
		}

		const data = JSON.stringify(object, null, "\t");
		//console.log(folder);
		const created = await folder.createFile(this.settingsFilename, {
			overwrite: true
		});
		await created.write(data, {
			append: false
		});
	}

	public static async importState(): Promise<any|null>{
		const folder = await this.settingsFolder();
		const entry:any = await folder.getEntry(this.settingsFilename);
		if (!entry.isFile) {
			return null;
		}
		try {
			const data: string = await entry.read();
			const result = JSON.parse(data);			
			return result;
		} catch (e) {
			console.log("Error - with reading of settings!");
			return null;
		}
	}

	public static async importStateWithDialog(): Promise<any|null>{
		const files = await localFileSystem.getFileForOpening({
			types: ["json"],
			allowMultiple: true
			//initialLocation: await this.settingsFolder()
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