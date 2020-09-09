import { ITargetReferenceAM, TReference } from "./GetInfo";

export class Reference {

	private ref: TReference[];

	constructor(ref: TReference[]) {
		this.ref = ref;
	}

	public get amCode(){
		return this.ref;
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

	public get hasProperty(): boolean {
		return !!this.property;
	}

	public get hasSnapshotClass(): boolean {
		return !!this.snapshotClass;
	}

	//

	public get action(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "action") || null;
	}

	public get actionSet(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "actionSet") || null;
	}

	public get application(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "application") || null;
	}

	public get channel(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "channel") || null;
	}

	public get command(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "command") || null;
	}

	public get document(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "document") || null;
	}

	public get guide(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "guide") || null;
	}

	public get historyState(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "historyState") || null;
	}

	public get layer(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "layer") || null;
	}

	public get path(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "path") || null;
	}

	public get property(): TReference | null {
		return this.ref.find(i => "_property" in i) || null;
	}

	public get snapshotClass(): TReference | null {
		return this.ref.find(i => "_ref" in i && i._ref === "snapshotClass") || null;
	}


}