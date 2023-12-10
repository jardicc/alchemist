import {isValidRef} from "../../shared/helpers";
import {TChannelReferenceValid} from "../model/types";

export type TReference = IPropertyReference | TReferenceNonProp;
export type TReferenceNonProp = INameReference<TClasses> | IDReference<TClasses> | IEnumReference<TClasses> | IndexReference<TClasses>;
export type TClasses = "application" | "document" | "layer" | "path" | "channel" | "actionSet" | "action" | "command" |
	"timeline" | "animationFrameClass" | "animationFrame" | "animationClass" | "historyState" | "snapshotClass" | "guide" | "animation";



export interface IDReference<T extends TClasses> {
	_ref: T,
	_id: number
}

export interface IndexReference<T extends TClasses> {
	_ref: T,
	_index: number
}

export interface INameReference<T extends TClasses> {
	_ref: T,
	_name: string
}

export interface IPropertyReference {
	_ref?: TClasses
	_property: string
}

export interface IEnumReference<T extends TClasses> {
	_ref: T
	_enum: string
	_value: string
}

export interface IApplicationReference {
	_ref: "application"
	_enum: "ordinal"
	_value: "targetEnum"
}

/** Semi-automated reference builder intended for references used in `get` action */
export class Reference {

	private ref: TReference[];

	public allClass: TClasses | false = false;

	constructor(ref: TReference[]) {
		this.ref = ref;
	}

	public get exists(): boolean {
		return isValidRef(this.refsOnly);
	}

	public get length(): number {
		return this.ref.length;
	}

	public get lengthNonProp(): number {
		return this.refsOnly.length;
	}

	public get amCode() {
		return this.ref;
	}

	public get propertiesOnly(): IPropertyReference[] {
		const res = this.ref.filter(v => ("_property" in v)) as IPropertyReference[];
		return res;
	}

	public get refsOnly(): TReferenceNonProp[] {
		const res = this.ref.filter(v => ("_ref" in v) && !("_property" in v)) as TReferenceNonProp[];
		return res;
	}

	public get targetClass() {
		const refs = this.refsOnly;
		if (!refs[0]) {
			return null;
		}
		return refs[0]._ref;
	}

	public get hasProperty(): boolean {
		return !!this.property;
	}

	public get hasAction(): boolean {
		return !!this.action;
	}

	public get hasActionSet(): boolean {
		return !!this.actionSet;
	}

	public get hasApplication(): boolean {
		return !!this.application;
	}

	public get hasChannel(): boolean {
		return !!this.channel;
	}

	public get hasCommand(): boolean {
		return !!this.command;
	}

	public get hasDocument(): boolean {
		return !!this.document;
	}

	public get hasGuide(): boolean {
		return !!this.guide;
	}

	public get hasHistoryState(): boolean {
		return !!this.historyState;
	}

	public get hasLayer(): boolean {
		return !!this.layer;
	}

	public get hasPath(): boolean {
		return !!this.path;
	}

	public get hasSnapshotClass(): boolean {
		return !!this.snapshotClass;
	}

	//

	public get property(): IPropertyReference | null {
		return this.ref.find(i => "_property" in i) as IPropertyReference || null;
	}

	public get action(): IDReference<"action"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "action") as IDReference<"action"> || null;
	}

	public get actionSet(): IDReference<"actionSet"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "actionSet") as IDReference<"actionSet"> || null;
	}

	public get application(): IApplicationReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "application") as IApplicationReference || null;
	}

	public get channel(): IDReference<"channel"> | IEnumReference<"channel"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "channel") as IDReference<"channel"> | IEnumReference<"channel"> || null;
	}

	public get command(): INameReference<"command"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "command") as INameReference<"command"> || null;
	}

	public get document(): IDReference<"document"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "document") as IDReference<"document"> || null;
	}

	public get guide(): IDReference<"guide"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "guide") as IDReference<"guide"> || null;
	}

	public get historyState(): IDReference<"historyState"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "historyState") as IDReference<"historyState"> || null;
	}

	public get layer(): IDReference<"layer"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "layer") as IDReference<"layer"> || null;
	}

	public get path(): IDReference<"path"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "path") as IDReference<"path"> || null;
	}

	public get snapshotClass(): IDReference<"snapshotClass"> | null {
		return this.ref.find(i => "_ref" in i && i._ref === "snapshotClass") as IDReference<"snapshotClass"> || null;
	}

	public clear() {
		this.ref = [];
	}

	public setAction(set: number, action?: number | null, command?: number | null) {
		if (this.refsOnly.length) {
			throw new Error("Can't set action because Reference is not empty");
		}
		if (command) {
			this.ref.push({
				_ref: "command",
				_index: command,
			});
		}

		if (action) {
			this.ref.push({
				_ref: "action",
				_id: action,
			});
		}

		if (set) {
			this.ref.push({
				_ref: "actionSet",
				_id: set,
			});
		}
	}

	/** We do allow multiple properties due to multiGet but PS does not allow it */
	public addProperty(property: string) {
		this.ref.unshift({
			_property: property,
		});
	}

	private addAtIndex(index: number, r: TReferenceNonProp) {
		if (index === -1) {
			this.ref.push(r);
		} else {
			this.ref.splice(index, 0, r);
		}
	}

	public setHistory(id: number) {
		// document can't coexist with history reference
		this.removeAllClasses("document");
		this.removeAllClasses("historyState");
		// application must be first if exists
		const index = this.getClassIndex("application");
		const r: IDReference<"historyState"> = {
			_ref: "historyState",
			_id: id,
		};
		this.addAtIndex(index, r);
	}

	public setLayer(id: number) {
		// some references can have multiple layers... maybe support it in future
		this.removeAllClasses("layer");
		const index = this.getClassIndex("document");
		const r: IDReference<"layer"> = {
			_ref: "layer",
			_id: id,
		};
		this.ref.splice(index, 0, r);
	}

	public setSnapshot(id: number) {
		// document can't coexist with history reference
		this.removeAllClasses("document");
		this.removeAllClasses("snapshotClass");
		// application must be first if exists
		const index = this.getClassIndex("application");
		const r: IDReference<"snapshotClass"> = {
			_ref: "snapshotClass",
			_id: id,
		};
		this.addAtIndex(index, r);
	}

	public setDocument(id: number) {
		this.removeAllClasses("document");
		// document can't coexist with history reference
		this.removeAllClasses("snapshotClass");
		this.removeAllClasses("historyState");
		// application must be first if exists
		const index = this.getClassIndex("application");
		const r: IDReference<"document"> = {
			_ref: "document",
			_id: id,
		};
		this.addAtIndex(index, r);
	}

	public setGuide(id: number) {
		this.removeAllClasses("guide");
		const index = this.getClassIndex("document");
		const r: IDReference<"guide"> = {
			_ref: "guide",
			_id: id,
		};
		this.ref.splice(index, 0, r);
	}

	public setVectorMask() {
		this.removeAllClasses("path");
		const index = this.findIndexForPath();

		const r: IEnumReference<"path"> = {
			_enum: "path",
			_ref: "path",
			_value: "vectorMask",
		};
		this.ref.splice(index, 0, r);
	}

	public setWorkPath() {
		this.removeAllClasses("path");
		const index = this.findIndexForPath();

		const r: IPropertyReference = {
			_ref: "path",
			_property: "workPath",
		};
		this.ref.splice(index, 0, r);
	}

	public setPath(id: number) {
		this.removeAllClasses("path");
		const index = this.findIndexForPath();

		const r: IDReference<"path"> = {
			_ref: "path",
			_id: id,
		};
		this.ref.splice(index, 0, r);
	}

	private findIndexForPath(): number {
		let index = this.getClassIndex("layer");
		if (index === -1) {
			index = this.getClassIndex("document");
		}
		return index;
	}

	private findIndexForChannel(): number {
		let index = this.getClassIndex("layer");
		if (index === -1) {
			index = this.getClassIndex("document");
		}
		return index;
	}

	public setChannel(id: TChannelReferenceValid) {
		this.removeAllClasses("channel");
		const index = this.findIndexForChannel();

		if (typeof id === "number") {
			const r: IDReference<"channel"> = {
				_ref: "channel",
				_id: id,
			};
			this.ref.splice(index, 0, r);
		} else {
			const r: IEnumReference<"channel"> = {
				_ref: "channel",
				_enum: "channel",
				_value: id,
			};
			this.ref.splice(index, 0, r);
		}
	}

	public setTimeline() {
		this.ref = [{
			_ref: "timeline",
			_enum: "ordinal",
			_value: "targetEnum",
		}];
	}

	public setAnimationFrame() {
		this.ref = [{
			_ref: "animationFrameClass",
			_enum: "ordinal",
			_value: "targetEnum",
		}];
	}

	public setAnimation() {
		this.ref = [{
			_ref: "animationClass",
			_enum: "ordinal",
			_value: "targetEnum",
		}];
	}

	/** Add application reference. Will replace if exists. Always is first. */
	public setApplication() {
		this.removeApplication();
		this.ref.unshift({
			_ref: "application",
			_enum: "ordinal",
			_value: "targetEnum",
		});
	}

	public removeApplication() {
		this.removeAllClasses("application");
	}

	public removeGuide() {
		this.removeAllClasses("guide");
	}

	public removeAllProperties() {
		this.ref = this.ref.filter(r => !("_property" in r));
	}

	private getClassIndex(myClass: TClasses) {
		const index = this.ref.findIndex(r => ("_ref" in r) && r._ref === myClass);
		return index;
	}

	private removeAllClasses(myClass: TClasses) {
		this.ref = this.ref.filter(r => (("_ref" in r) && r._ref === myClass) === false);
	}



}