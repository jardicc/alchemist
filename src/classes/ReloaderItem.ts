export class ReloaderItem{

	public initialTime:Date

	constructor(public entry: any) {}

	public async init() {
		this.initialTime = await this.getModifiedTime();
	}

	public async reloadIfChanged() {
		if (!this.initialTime) {
			return
		}
		const newTime = await this.getModifiedTime();
		if (newTime.getTime() > this.initialTime.getTime()) {
			console.log("Reload Activated");
			location.reload(true);
		}
		this.initialTime = newTime;
	}

	private async getModifiedTime():Promise<Date> {
		const meta =  await this.entry.getMetadata();
		const result = meta.dateModified;
		return result;
	}
}