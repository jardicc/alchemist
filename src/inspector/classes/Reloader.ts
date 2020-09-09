import { ReloaderItem } from "./ReloaderItem";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const localFileSystem = require("uxp").storage.localFileSystem;


export class Reloader{
	
	constructor(private _files: string[], private _interval: number = 800) { }
	
	private timer: number | null = null;
	private foundEntries: ReloaderItem[] = [];

	public get files():string[] {
		return this._files;
	}

	public get interval():number {
		return this._interval;
	}

	public async initWatchedFiles(): Promise<void> {
		const pluginFolder = await localFileSystem.getPluginFolder();

		const entries:any[] = await pluginFolder.getEntries();		
		this.foundEntries = entries
			.filter(file => this.files.includes(file.name))
			.map(file => new ReloaderItem(file));
		// init all at once
		await Promise.all(this.foundEntries.map(item => item.init()));
	}

	private update() {
		this.foundEntries.map(item => item.reloadIfChanged());
	}

	public async start():Promise<void> {
		this.stop();
		await this.initWatchedFiles();
		this.timer = window.setInterval(() => {
			this.update();
		}, this.interval);
	}

	public stop():void {
		if (this.timer !== null) {
			window.clearInterval(this.timer);
			this.timer = null;
			this.foundEntries = [];
		}
	}
}