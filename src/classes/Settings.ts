const localFileSystem = require("uxp").storage.localFileSystem;

export class Settings{
	constructor() {
		
	}

	public static loaded: boolean = false;

	private static readonly settingsFilename = "settings.json";

	public static async settingsFolder() {
		const folder = await localFileSystem.getDataFolder();
		return folder;
	}

	public static async saveSettings(object: any): Promise<void> {
		if (!this.loaded) {
			return
		}
		const data = JSON.stringify(object, null, "\t");
		
		const folder = await this.settingsFolder();
		console.log(folder);
		const created = await folder.createFile(this.settingsFilename, {
			overwrite: true
		});
		await created.write(data, {
			append: false
		});
	}

	public static async loadSettings(): Promise<any|null>{
		const folder = await this.settingsFolder();
		const entries:any[] = await folder.getEntries();
		const found = entries.find(file => file.name === this.settingsFilename);
		if (!found) {
			return null
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
}