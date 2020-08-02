//import photoshop from "photoshop";
//import Document from "photoshop/dist/dom/Document";
import type { Descriptor, PhotoshopAction } from "photoshop/dist/types/UXP";
import { IDReference } from "./GetInfo";
import { ActionDescriptor } from "photoshop/dist/types/photoshop";
import type Document from "photoshop/dist/dom/Document";

type TDocument = typeof Document;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DocumentNative:TDocument  = require("photoshop").app.Document;

export class DocumentExtra extends DocumentNative{

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	public action:PhotoshopAction = require("photoshop").action;

	constructor(doc: Document) {
		super(doc._id);
		if (typeof doc._id !== "number") {
			throw new Error("number expected");
		}
	}

	public get amReference():IDReference {
		return ({
			"_ref": "document",
			"_id": this._id
		});
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

	public get userChannelIDsAndNames(): {value: number;label: string;index:number}[] {
		const len = this.numberOfChannels;
		const descID: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++) {
			descID.push({
				_obj: "get",
				_target: [
					{
						"_property": "ID"
					},
					{
						"_ref": "channel",
						"_index": i
					},
					this.amReference
				]
			});
		}
		const desResultIDs = this.action.batchPlay(descID, {
			synchronousExecution: true
		}) as Descriptor[];

		const descName: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++) {
			descName.push({
				_obj: "get",
				_target: [
					{
						"_property": "channelName"
					},
					{
						"_ref": "channel",
						"_index": i
					},
					this.amReference
				]
			});
		}
		const desResultNames = this.action.batchPlay(descName, {
			synchronousExecution: true
		}) as Descriptor[];

		const pairs = desResultIDs.map((d, index) => ({
			value: d.ID,
			label: desResultNames[index].channelName,
			index: index
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
						"_index": i
					},
					this.amReference
				]
			});
		}
		const desResult = this.action.batchPlay(desc, {
			synchronousExecution: true
		}) as Descriptor[];

		let pairs = desResult.map((d, index) => ({
			value: d.ID,
			label: d.pathName,
			type: d.kind._value
		}));
		pairs = pairs.filter(pair => (pair.type === "clippingPathEPS" || pair.type === "normalPath"));
		const result = pairs.map(pair => ({value:pair.value,label:pair.label}));
	
		return pairs;
	}

	public getPropertySync(property: string):any {
		const desc = this.action.batchPlay([
			{
				_obj: "get",
				_target: [
					{
						"_property": property
					},
					this.amReference
				]
			}
		], {
			synchronousExecution: true
		}) as Descriptor[];
		return desc?.[0]?.[property];
	}
}