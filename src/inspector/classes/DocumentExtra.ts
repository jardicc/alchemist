//import photoshop from "photoshop";
//import Document from "photoshop/dist/dom/Document";
import photoshop, { action, Document, ActionDescriptor } from "photoshop";
import { IDReference } from "./GetInfo";
import { syncBatchPlay } from "../../photoshop-helpers";

export class DocumentExtra extends photoshop.app.Document {
	public action = photoshop.action;

	constructor(doc: Document) {
		super(doc._id);
		if (typeof doc._id !== "number") {
			throw new Error("number expected");
		}
	}

	public get amReference():IDReference {
		return ({
			"_ref": "document",
			"_id": this._id,
		});
	}

	public get exists(): boolean{
		return action.validateReference([this.amReference]);
	}

	public get colorMode(): number{
		return this.getPropertySync("mode")._value;
	}

	public get numberOfPaths(): number{
		return this.getPropertySync("numberOfPaths");
	}

	public get numberOfChannels(): number{
		return this.getPropertySync("numberOfChannels");
	}

	public get numberOfGuides(): number{
		return this.getPropertySync("numberOfGuides");
	}

	public async $title(): Promise<string>{
		return await this.getPropertyAsync("title");
	}

	public get guidesIDs(): { value: number; label: string }[]{
		const len = this.numberOfGuides;
		const desc: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++){
			desc.push({
				_obj: "get",
				_target: [
					{
						"_ref": "guide",
						"_index": i,
					},
					this.amReference,
				],
			});
		}

		const desResult = syncBatchPlay(desc);

		const pairs = desResult.map((d) => ({
			value: d.ID,
			label: d.ID,
		}));
	
		return pairs;
	}

	public get userChannelIDsAndNames(): {value: number;label: string;index:number}[] {
		const len = this.numberOfChannels;
		const descID: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++) {
			descID.push({
				_obj: "get",
				_target: [
					{
						"_property": "ID",
					},
					{
						"_ref": "channel",
						"_index": i,
					},
					this.amReference,
				],
			});
		}
		const desResultIDs = syncBatchPlay(descID);

		const descName: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++) {
			descName.push({
				_obj: "get",
				_target: [
					{
						"_property": "channelName",
					},
					{
						"_ref": "channel",
						"_index": i,
					},
					this.amReference,
				],
			});
		}
		const desResultNames = syncBatchPlay(descName);

		const pairs = desResultIDs.map((d, index) => ({
			value: d.ID,
			label: desResultNames[index].channelName,
			index: index,
		})).filter(pair => (typeof pair.value === "number"));

		return pairs;
	}

	public get userPathsIDsAndNames(): {value: number;label: string}[] {
		const len = this.numberOfPaths;
		const desc: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++) {
			desc.push({
				_obj: "get",
				_target: [
					{
						"_ref": "path",
						"_index": i,
					},
					this.amReference,
				],
			});
		}
		const desResult = syncBatchPlay(desc);

		let pairs = desResult.map((d) => ({
			value: d.ID,
			label: d.pathName,
			type: d.kind._value,
		}));
		pairs = pairs.filter(pair => (pair.type === "clippingPathEPS" || pair.type === "normalPath"));
		//const result = pairs.map(pair => ({value:pair.value,label:pair.label}));
	
		return pairs;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getPropertySync(property: string):any {
		const desc = syncBatchPlay([
			{
				_obj: "get",
				_target: [
					{
						"_property": property,
					},
					this.amReference,
				],
			},
		]);
		return desc?.[0]?.[property];
	}

	public async getPropertyAsync(property: string): Promise<any> {
		const desc = await this.action.batchPlay([
			{
				_obj: "get",
				_target: [
					{
						"_property": property,
					},
					this.amReference,
				],
			},
		], {
			synchronousExecution: false,
		});
		return desc?.[0]?.[property];
	}
}
