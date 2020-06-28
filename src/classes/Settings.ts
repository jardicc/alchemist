// eslint-disable-next-line @typescript-eslint/no-var-requires
const localFileSystem = require("uxp").storage.localFileSystem;

export class Settings{

	public static loaded = false;

	private static readonly settingsFilename = "settings.json";

	public static async settingsFolder() {
		const folder = await localFileSystem.getDataFolder();
		return folder;
	}

	public static async saveSettings(object: any): Promise<void> {		
		const folder = await this.settingsFolder();
		await this._saveSettings(object, folder);
	}

	public static async saveSettingsWithDialog(object: any): Promise<void>{
		const file = await localFileSystem.getFileForSaving(Date.now() + ".json", {
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
		console.log(folder);
		const created = await folder.createFile(this.settingsFilename, {
			overwrite: true
		});
		await created.write(data, {
			append: false
		});
	}

	public static async importState(): Promise<any|null>{
		const folder = await this.settingsFolder();
		const entries:any[] = await folder.getEntries();
		const found = entries.find(file => file.name === this.settingsFilename);
		if (!found) {
			return null;
		}
		const data: string = await found.read();
		try {
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