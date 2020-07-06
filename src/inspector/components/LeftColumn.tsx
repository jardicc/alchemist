import React, { ReactNode } from "react";
import "./LeftColumn.css";
import { ITargetReference, IPropertySettings, IDescriptor, TDocumentReference, TTargetReference, ITargetReferenceApplication, ITargetReferenceCustomDescriptor, ITargetReferenceHistory, ITargetReferenceSnapshot, ITargetReferenceLayer, ITargetReferencePath, ITargetReferenceChannel, ITargetReferenceDocument, ITargetReferenceGuide, ITargetReferenceAction, TLayerReference, TGuideReference, TPathReference, TChannelReference, TBaseProperty } from "../reducers/initialStateInspector";
import { cloneDeep } from "lodash";
import { findActiveTargetReference, getActiveReferenceActionItem, getActiveReferenceActionSet } from "../selectors/inspectorSelectors";
import { GetInfo } from "../classes/GetInfo";
import { DescriptorItemContainer } from "./DescriptorItemContainer";

interface IProperty<T>{
	label: string
	value:T
}

export interface ILeftColumnProps{
	targetReference: ITargetReference
	autoUpdate: boolean
	addAllowed:boolean
	selectedDescriptors: string[]
	propertySettings: IPropertySettings[]
	lockedSelection: boolean
	pinnedSelection: boolean
	removableSelection: boolean
	allDescriptors: IDescriptor[]
	activeTargetReference: null | ITargetReferenceApplication | ITargetReferenceCustomDescriptor | ITargetReferenceHistory | ITargetReferenceSnapshot | ITargetReferenceLayer | ITargetReferencePath | ITargetReferenceChannel | ITargetReferenceDocument | ITargetReferenceGuide | ITargetReferenceAction | Record<string, unknown>;
	activeTargetReferenceDocument: TDocumentReference
	activeTargetLayerReference: TLayerReference
	activeReferenceGuide: TGuideReference
	activeReferencePath: TPathReference
	activeReferenceChannel: TChannelReference
	activeReferenceActionSet:string
	activeReferenceActionItem:string
	activeReferenceCommand: string
	activeReferenceProperty: string
}

export interface ILeftColumnDispatch {
	onSetTargetReference: (arg: ITargetReference) => void
	onAddDescriptor:(descriptor: IDescriptor)=>void
}

interface ILeftColumnState{
	
}

export type TLeftColumn = ILeftColumnProps & ILeftColumnDispatch

export class LeftColumn extends React.Component<TLeftColumn, ILeftColumnState> { 
	constructor(props: TLeftColumn) {
		super(props);

		this.state = {
		};
	}

	private mainClasses:IProperty<TTargetReference>[] = [
		{ label: "(undefined)", value: "undefined" },
		{ label: "Application", value: "application" },
		{ label: "Document", value: "document" },
		{ label: "Layer", value: "layer" },
		{ label: "Channel", value: "channel" },
		{ label: "Path", value: "path" },
		{ label: "Action", value: "action" },
		{ label: "Guide", value: "guide" },
		{ label: "History", value: "history" },
		{ label: "Snapshot", value: "snapshot" },
		{ label: "Custom descriptor", value: "customDescriptor" },
		{ label: "Generator", value: "allFromGenerator" },
		{ label: "Features", value: "featureData" },
	]

	private baseItemsProperty:IProperty<TBaseProperty>[] = [
		{ label: "(undefined)", value: "undefined" },
		{ label: "(not specified)", value: "notSpecified" },
		{ label: "(any specified)", value: "anySpecified" },
	];
	private baseItemsCustomDescriptor:IProperty<string>[] = [
		{ label: "(undefined)", value: "undefined" },
	];
	private baseItemsDocument:IProperty<TDocumentReference>[] = [
		{ label: "(undefined)", value: "undefined" },
		{ label: "(active)", value: "active" },
	];
	private baseItemsLayer:IProperty<TLayerReference>[] = [
		{ label: "(undefined)", value: "undefined" },
		{ label: "(active)", value: "active" },
	];
	private baseItemsPath :IProperty<TPathReference>[]= [
		{ label: "(undefined)", value: "undefined" },
		{ label: "(active)", value: "active" },
		{ label: "(vector mask)", value: "vectorMask" },
		{ label: "(work path)", value: "workPathIndex" },
	];
	private baseItemsChannel:IProperty<TChannelReference>[] = [
		{ label: "(undefined)", value: "undefined" },
		{ label: "(active)", value: "active" },
		{ label: "(composite)",value: "composite"},
		{ label: "(Mask)",value: "mask"},
		{ label: "(Filter mask)",value: "filterMask"},
		{ label: "(Transparency)",value: "transparencyEnum"},
		{ label: "(RGB)",value: "RGB"},
		{ label: "(Red - RGB)",value: "red"},
		{ label: "(Green - RGB)",value: "green"},
		{ label: "(Blue - RGB)",value: "blue"},
		{ label: "(CMYK)",value: "CMYK"},
		{ label: "(Black - CMYK)",value: "black"},
		{ label: "(Cyan - CMYK)",value: "cyan"},
		{ label: "(Magenta - CMYK)",value: "magenta"},
		{ label: "(Yellow - CMYK)",value: "yellow"},
		{ label: "(Lab)",value: "lab"},
		{ label: "(Lightness - Lab)",value: "lightness"},
		{ label: "(a - Lab)",value: "a"},
		{ label: "(b - Lab)",value: "b"},
		{ label: "(Gray)",value: "gray"},
		{ label: "(Monotone)",value: "monotone"},
		{ label: "(Duotone)",value: "duotone"},
		{ label: "(Tritone)",value: "tritone"},
		{ label: "(Quadtone)",value: "quadtone"},

	];
	private baseItemsGuide = [
		{ label: "(undefined)", value: "undefined" },
	];	
	private baseItemsActionCommon = [
		{ label: "(undefined)", value: "undefined" },
		{ label: "fake", value: "fake" },
	];	

	private onSetProperty = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("property" in found)) {
			found.property = value.target.value;
			onSetTargetReference(refCopy);
		}
	}

	private onSetActionSet = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("action" in found)) {
			found.actionset = value.target.value;
			onSetTargetReference(refCopy);
		}
	}
	private onSetActionItem= (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("action" in found)) {
			found.action = value.target.value;
			onSetTargetReference(refCopy);
		}
	}
	private onSetCommand = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("action" in found)) {
			found.command = value.target.value;
			onSetTargetReference(refCopy);
		}
	}

	private onSetGuide = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("guide" in found)) {
			found.guide = value.target.value;
			onSetTargetReference(refCopy);
		}
	}
	private onSetChannel = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("channel" in found)) {
			found.channel = value.target.value;
			onSetTargetReference(refCopy);
		}
	}

	private onSetPath = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("path" in found)) {
			found.path = value.target.value;
			onSetTargetReference(refCopy);
		}
	}

	private onSetLayer = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("layer" in found)) {
			found.layer = value.target.value;
			onSetTargetReference(refCopy);
		}
	}

	private onSetDocument = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		const found = findActiveTargetReference(targetReference.activeType, refCopy);
		if (found && ("document" in found)) {
			found.document = value.target.value;
			onSetTargetReference(refCopy);
		}
	}

	private onSetMainClass = (value: any) => {
		const { onSetTargetReference, targetReference } = this.props;
		const refCopy = cloneDeep(targetReference);
		refCopy.activeType = value.target.value;
		onSetTargetReference(refCopy);
	}

	private renderActionSet = ():React.ReactNode=>{
		const { activeType } = this.props.targetReference;
		if (activeType !== "action") { return;}
		const { activeReferenceActionSet } = this.props;
		const list = [...this.baseItemsActionCommon];

		return (
			<div className="filter">
				<div className="label">Action set:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetActionSet}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceActionSet === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}

	private renderActionItem = ():React.ReactNode=>{
		const { activeType } = this.props.targetReference;
		if (activeType !== "action") { return;}
		const { activeReferenceActionItem,activeReferenceActionSet } = this.props;
		if (activeReferenceActionSet === "undefined") { return;}
		const list = [...this.baseItemsActionCommon];
		return (
			<div className="filter">
				<div className="label">Action:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetActionItem}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceActionItem === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}

	private renderCommand = ():React.ReactNode=>{
		const { activeType } = this.props.targetReference;
		if (activeType !== "action") { return;}
		const { activeReferenceCommand, activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (activeReferenceActionSet === "undefined") { return;}
		if (activeReferenceActionItem === "undefined") { return;}
		const list = [...this.baseItemsActionCommon];

		return (
			<div className="filter">
				<div className="label">Command:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetCommand}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceCommand === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}


	private renderProperty = (): React.ReactNode => {
		const { activeType } = this.props.targetReference;
		const { propertySettings,activeReferenceProperty } = this.props;
		
		switch (activeType) {
			case "undefined": 
			case "customDescriptor":
			case "featureData":
			case "allFromGenerator": 
				return;
		}

		let foundSettings: IPropertySettings|undefined;

		switch (activeType) {
			case "action":
				foundSettings = propertySettings.find(p => p.type === "action");
				break;
			case "application":
				foundSettings = propertySettings.find(p => p.type === "application");
				break;
			case "channel":
				foundSettings = propertySettings.find(p => p.type === "channel");
				break;
			case "document":
				foundSettings = propertySettings.find(p => p.type === "document");
				break;
			case "guide":
				foundSettings = propertySettings.find(p => p.type === "guide");
				break;
			case "history":
				foundSettings = propertySettings.find(p => p.type === "history");
				break;
			case "layer":
				foundSettings = propertySettings.find(p => p.type === "layer");
				break;
			case "path":
				foundSettings = propertySettings.find(p => p.type === "path");
				break;
			case "snapshot":
				foundSettings = propertySettings.find(p => p.type === "snapshot");
				break;
		}

		if (!foundSettings) { throw new Error("Properties not found");}

		const defaultList: IProperty<string>[] = foundSettings.list.filter(p => p.type === "default").map(f => ({ label: f.title, value: f.stringID }));
		const hiddenList: IProperty<string>[] = foundSettings.list.filter(p => p.type === "hidden").map(f => ({ label: f.title, value: f.stringID }));
		const optionalList: IProperty<string>[] = foundSettings.list.filter(p => p.type === "optional").map(f => ({ label: f.title, value: f.stringID }));

		return (
			<div className="filter">
				<div className="label">Property:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetProperty}>
						{
							this.baseItemsProperty.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceProperty === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
						<sp-menu-divider></sp-menu-divider>
						<sp-menu-group>
							<span slot="header">Default</span>
							{
								defaultList.map(item => (
									<sp-menu-item
										key={item.value}
										value={item.value}
										selected={activeReferenceProperty === item.value ? "selected" : null}
									>{item.label}</sp-menu-item>
								))
							}
						</sp-menu-group>
						<sp-menu-divider></sp-menu-divider>
						<sp-menu-group>
							<span slot="header">Optional</span>
							{
								optionalList.map(item => (
									<sp-menu-item
										key={item.value}
										value={item.value}
										selected={activeReferenceProperty === item.value ? "selected" : null}
									>{item.label}</sp-menu-item>
								))
							}
						</sp-menu-group>
						<sp-menu-divider></sp-menu-divider>
						<sp-menu-group>
							<span slot="header">Hidden</span>
							{
								hiddenList.map(item => (
									<sp-menu-item
										key={item.value}
										value={item.value}
										selected={activeReferenceProperty === item.value ? "selected" : null}
									>{item.label}</sp-menu-item>
								))
							}
						</sp-menu-group>
						<sp-menu-divider></sp-menu-divider>
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}
	private renderGuide = ():React.ReactNode=>{
		const { activeType } = this.props.targetReference;
		if (activeType !== "guide") { return;}
		const list = [...this.baseItemsGuide];

		const { activeReferenceGuide } = this.props;
		return (
			<div className="filter">
				<div className="label">Guide:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetGuide}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceGuide === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}
	private renderChannel = ():React.ReactNode=>{
		const { activeType } = this.props.targetReference;
		if (activeType !== "channel") { return;}
		const list = [...this.baseItemsChannel];

		const { activeReferenceChannel } = this.props;
		return (
			<div className="filter">
				<div className="label">Channel:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetChannel}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceChannel === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}
	private renderPath = ():React.ReactNode=>{
		const { activeType } = this.props.targetReference;
		if (activeType !== "path") { return;}
		const list = [...this.baseItemsPath];

		const { activeReferencePath } = this.props;
		return (
			<div className="filter">
				<div className="label">Path:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetPath}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferencePath === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}
	private renderDocument = (): React.ReactNode => {
		const { activeType } = this.props.targetReference;
		
		switch (activeType) {
			case "undefined": 
			case "customDescriptor":
			case "featureData":
			case "allFromGenerator": 
			case "application":
			case "action":
				return;
		}

		const list = [...this.baseItemsDocument];

		const { activeTargetReferenceDocument } = this.props;
		return (
			<div className="filter">
				<div className="label">Document:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetDocument}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeTargetReferenceDocument === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}
	private renderLayer = (): React.ReactNode => {
		const { activeReferenceChannel, activeReferencePath } = this.props;
		const { activeType } = this.props.targetReference;
		
		if ((activeType === "layer" || activeType === "channel" || activeType === "path") === false) {
			return;
		}
		// only layer masks are layer related
		if (activeType === "channel" && (activeReferenceChannel !== "mask" && activeReferenceChannel !== "filterMask")) {
			return;
		}
		// only vector masks are layer related
		if (activeType === "path" && activeReferencePath !== "vectorMask") {
			return;
		}

		const list = [...this.baseItemsLayer];
		
		const { activeTargetLayerReference } = this.props;
		return (
			<div className="filter">
				<div className="label">Layer:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetLayer}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeTargetLayerReference === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}
	private renderCustomDescriptorCategory = ():React.ReactNode => {
		if (this.props.targetReference.activeType !== "customDescriptor") {
			return null;
		}

		const list = [...this.baseItemsCustomDescriptor];

		return (
			<div className="filter">
				<div className="label">Category:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={(e:string) => { console.log(e);}}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={this.props.targetReference.activeType === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}

	private renderMainClass = ():React.ReactNode => {
		return (
			<div className="filter">
				<div className="label">Type:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetMainClass}>
						{
							this.mainClasses.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={this.props.targetReference.activeType === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}

	private getDescriptor = async(): Promise<void> => {
		if (!this.props.addAllowed) {
			return;
		}
		const result = await GetInfo.getAM(this.props.targetReference.activeType, this.props.activeTargetReference);
		if (result === null) { return;}
		this.props.onAddDescriptor(result);

	}

	private renderFilters = ():React.ReactNode => {
		return (
			<React.Fragment>
				{this.renderMainClass()}
				{this.renderDocument()}
				{this.renderGuide()}
				{this.renderChannel()}
				{this.renderPath()}
				{this.renderLayer()}
				{this.renderCustomDescriptorCategory()}
				{this.renderActionSet()}
				{this.renderActionItem()}
				{this.renderCommand()}
				{this.renderProperty()}
			</React.Fragment>
		);
	}

	private renderDescriptorsList = ():React.ReactNode => {
		return (
			this.props.allDescriptors.map(d => (
				<DescriptorItemContainer descriptor={d} key={d.id} />
			))
		);
	}

	public render(): JSX.Element {
		const { addAllowed} = this.props;
		return (
			<div className="LeftColumn">
				<div>
					{this.renderFilters()}
				</div>
				<div className="buttons">
					<div className={"add" + (addAllowed ? " allowed" : " disallowed")} onClick={this.getDescriptor}>+ Add</div>
				</div>
				<div className="descriptorsWrapper">
					{this.renderDescriptorsList()}
				</div>
				<div>
					
				</div>
			</div>
		);
	}
}