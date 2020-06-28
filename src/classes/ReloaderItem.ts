export class ReloaderItem{

	public initialTime: Date|null = null;

	constructor(public entry: any) {}

	public async init():Promise<void> {
		this.initialTime = await this.getModifiedTime();
	}

	public async reloadIfChanged():Promise<void> {
		if (!this.initialTime) {
			return;
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