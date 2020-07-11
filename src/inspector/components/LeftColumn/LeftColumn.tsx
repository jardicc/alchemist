import React from "react";
import "./LeftColumn.less";
import { cloneDeep } from "lodash";
import { GetInfo } from "../../classes/GetInfo";
import { DescriptorItemContainer } from "../DescriptorItem/DescriptorItemContainer";
import { baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument, baseItemsLayer, baseItemsCustomDescriptor, mainClasses, baseItemsProperty, TBaseItems } from "../../model/properties";
import { TTargetReferenceArr, IPropertySettings, IDescriptor, TActiveTargetReferenceArr, TDocumentReference, TLayerReference, TGuideReference, TPathReference, TChannelReference, TTargetReference } from "../../model/types";

export interface IProperty<T>{
	label: string
	value:T
}

export interface ILeftColumnProps{
	targetReference: TTargetReferenceArr
	autoUpdate: boolean
	addAllowed:boolean
	selectedDescriptors: string[]
	propertySettings: IPropertySettings[]
	lockedSelection: boolean
	pinnedSelection: boolean
	removableSelection: boolean
	allDescriptors: IDescriptor[]

	activeTargetReference: TActiveTargetReferenceArr|undefined;
	activeTargetReferenceDocument: TDocumentReference|null
	activeTargetLayerReference: TLayerReference|null
	activeReferenceGuide: TGuideReference|null
	activeReferencePath: TPathReference|null
	activeReferenceChannel: TChannelReference|null
	selectedTargetReference: TTargetReference|null
	activeReferenceActionSet:string|null
	activeReferenceActionItem:string|null
	activeReferenceCommand: string|null
	activeReferenceProperty: string|null
	hasAutoActiveDescriptor:boolean
}

export interface ILeftColumnDispatch {
	onSetTargetReference: (arg: TActiveTargetReferenceArr) => void
	onAddDescriptor: (descriptor: IDescriptor) => void
	onSetSelectedReferenceType: (type: TTargetReference) => void
	
	onClear: () => void
	onPin: (pin: boolean, uuids: string[]) => void
	onRemove: (uuids: string[]) => void
	onLock: (lock: boolean, uuids: string[]) => void
}

export type TLeftColumn = ILeftColumnProps & ILeftColumnDispatch

export class LeftColumn extends React.Component<TLeftColumn> {
	constructor(props: TLeftColumn) {
		super(props);
		this.state = {
		};
	}

	private onSetProperty = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference, } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("property" in found.data)) {
			found.data.property.value = value.target.value;
			onSetTargetReference(found);
		}
	}

	private onSetActionSet = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("action" in found.data)) {
			found.data.actionset.value = value.target.value;
			onSetTargetReference(found);
		}
	}
	private onSetActionItem = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("action" in found.data)) {
			found.data.action.value = value.target.value;
			onSetTargetReference(found);
		}
	}
	private onSetCommand = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("action" in found.data)) {
			found.data.command.value = value.target.value;
			onSetTargetReference(found);
		}
	}

	private onSetGuide = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("guide" in found.data)) {
			found.data.guide.value = value.target.value as TDocumentReference;
			onSetTargetReference(found);
		}
	}
	private onSetChannel = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("channel" in found.data)) {
			found.data.channel.value = value.target.value as TChannelReference;
			onSetTargetReference(found);
		}
	}

	private onSetPath = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("path" in found.data)) {
			found.data.path.value = value.target.value as TPathReference;
			onSetTargetReference(found);
		}
	}

	private onSetLayer = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("layer" in found.data)) {
			found.data.layer.value = value.target.value as TLayerReference;
			onSetTargetReference(found);
		}
	}

	private onSetDocument = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onSetTargetReference, activeTargetReference } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found && ("document" in found.data)) {
			found.data.document.value = value.target.value as TDocumentReference;
			onSetTargetReference(found);
		}
	}

	private onSetMainClass = (value: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onSetSelectedReferenceType(value.target.value as TTargetReference);
	}

	private renderActionSet = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionSet } = this.props;
		const list = [...baseItemsActionCommon];

		
		return this.buildFilterRow("Action set:", this.onSetActionSet, list, activeReferenceActionSet as string);
	}

	private renderActionItem = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (activeReferenceActionSet === "undefined") { return; }
		const list = [...baseItemsActionCommon];

		return this.buildFilterRow("Action:", this.onSetActionItem, list, activeReferenceActionItem as string);
	}

	private renderCommand = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceCommand, activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (activeReferenceActionSet === "undefined") { return; }
		if (activeReferenceActionItem === "undefined") { return; }
		const list = [...baseItemsActionCommon];

		return this.buildFilterRow("Command:", this.onSetCommand, list, activeReferenceCommand as string);
	}


	private renderProperty = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		const { propertySettings, activeReferenceProperty } = this.props;
		
		switch (selectedTargetReference) {
			case "customDescriptor":
			case "featureData":
			case "generator":
				return;
		}

		const foundSettings: IPropertySettings | undefined = propertySettings.find(p => p.type === selectedTargetReference);
		if (!foundSettings) { throw new Error("Properties not found"); }

		const defaultList: IProperty<string>[] = foundSettings.list.filter(p => p.type === "default").map(f => ({ label: f.title, value: f.stringID }));
		const hiddenList: IProperty<string>[] = foundSettings.list.filter(p => p.type === "hidden").map(f => ({ label: f.title, value: f.stringID }));
		const optionalList: IProperty<string>[] = foundSettings.list.filter(p => p.type === "optional").map(f => ({ label: f.title, value: f.stringID }));

		const mapFc = (item: IProperty<string>) => (
			<sp-menu-item
				key={item.value}
				value={item.value}
				selected={activeReferenceProperty === item.value ? "selected" : null}
			>{item.label}</sp-menu-item>
		);

		const hidden = hiddenList.length === 0 ? null : (
			<React.Fragment>
				<sp-menu-divider />
				<sp-menu-group>
					<span slot="header">Hidden</span>
					{hiddenList.map(mapFc)}
				</sp-menu-group>
			</React.Fragment>
		);

		const optional = optionalList.length === 0 ? null : (
			<React.Fragment>
				<sp-menu-divider />
				<sp-menu-group>
					<span slot="header">Optional</span>
					{optionalList.map(mapFc)}
				</sp-menu-group>
			</React.Fragment>
		);
		const defaultEl = defaultList.length === 0 ? null : (
			<React.Fragment>
				<sp-menu-divider />
				<sp-menu-group>
					<span slot="header">Default</span>
					{defaultList.map(mapFc)}
				</sp-menu-group>
			</React.Fragment>
		);

		return (
			<div className="filter">
				<div className="label">Property:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={this.onSetProperty}>
						{
							baseItemsProperty.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceProperty === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
						{defaultEl}
						{optional}
						{hidden}
					</sp-menu>
				</sp-dropdown>
				<div className="button">F</div>
			</div>
		);
	}
	private renderGuide = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "guide") { return; }
		const list = [...baseItemsGuide];

		const { activeReferenceGuide } = this.props;
		return this.buildFilterRow("Guide:", this.onSetGuide, list, activeReferenceGuide as string);
	}
	private renderChannel = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "channel") { return; }
		const list = [...baseItemsChannel];

		const { activeReferenceChannel } = this.props;
		return this.buildFilterRow("Channel:", this.onSetChannel, list, activeReferenceChannel as string);
	}

	private renderPath = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "path") { return; }
		const list = [...baseItemsPath];

		const { activeReferencePath } = this.props;

		return this.buildFilterRow("Path:", this.onSetPath, list, activeReferencePath as string);
	}

	private renderDocument = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		
		switch (selectedTargetReference) {
			case "customDescriptor":
			case "featureData":
			case "generator":
			case "application":
			case "action":
				return;
		}

		const list = [...baseItemsDocument];

		const { activeTargetReferenceDocument } = this.props;
		return this.buildFilterRow("Document:", this.onSetDocument, list, activeTargetReferenceDocument as string);
	}

	private renderLayer = (): React.ReactNode => {
		const { activeReferenceChannel, activeReferencePath } = this.props;
		const { selectedTargetReference } = this.props;
		
		if ((selectedTargetReference === "layer" || selectedTargetReference === "channel" || selectedTargetReference === "path") === false) {
			return;
		}
		// only layer masks are layer related
		if (selectedTargetReference === "channel" && (activeReferenceChannel !== "mask" && activeReferenceChannel !== "filterMask")) {
			return;
		}
		// only vector masks are layer related
		if (selectedTargetReference === "path" && activeReferencePath !== "vectorMask") {
			return;
		}

		const list = [...baseItemsLayer];
		
		const { activeTargetLayerReference } = this.props;

		return this.buildFilterRow("Layer:", this.onSetLayer, list, activeTargetLayerReference as string);		
	}

	private renderCustomDescriptorCategory = (): React.ReactNode => {
		if (this.props.selectedTargetReference !== "customDescriptor") {
			return null;
		}

		const list = [...baseItemsCustomDescriptor];

		return (
			<div className="filter">
				<div className="label">Category:</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={(e: string) => { console.log(e); }}>
						{
							list.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={this.props.selectedTargetReference === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
			</div>
		);
	}

	private renderMainClass = (): React.ReactNode => {
		return this.buildFilterRow("Type:", this.onSetMainClass, mainClasses, this.props.selectedTargetReference);
	}

	private buildFilterRow = (
		label: string,
		handler: (value: React.ChangeEvent<HTMLSelectElement>) => void,
		items: TBaseItems,
		selectedValue: string|null
	): React.ReactNode => {
		return (
			<div className="filter">
				<div className="label">{label}</div>
				<sp-dropdown quiet="true" onClick={() => { console.log("click"); }}>
					<sp-menu slot="options" onClick={handler}>
						{							
							items.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={selectedValue === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
				<div className="button">F</div>
			</div>
		);
	}

	private getDescriptor = async (): Promise<void> => {
		const { activeTargetReference } = this.props;
		if (!this.props.addAllowed) {
			return;
		}
		const result = await GetInfo.getAM(activeTargetReference);
		if (result === null) { return; }
		this.props.onAddDescriptor(result);

	}

	private renderFilters = (): React.ReactNode => {
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

	private renderDescriptorsList = (): React.ReactNode => {
		const {allDescriptors,hasAutoActiveDescriptor } = this.props;
		return (
			allDescriptors.map((d, index) => (
				<DescriptorItemContainer descriptor={d} key={d.id} autoSelected={index === 0 && hasAutoActiveDescriptor} />
			))
		);
	}

	public render(): JSX.Element {
		const { addAllowed, onLock, onPin, onRemove, selectedDescriptors, lockedSelection, pinnedSelection } = this.props;
		return (
			<div className="LeftColumn">
				<div className="oneMore">

				
					<div className="filtersWrapper">
						{this.renderFilters()}
					</div>
					<div className="filterButtons">
						<div className={"add button" + (addAllowed ? " allowed" : " disallowed")} onClick={this.getDescriptor}>+ Add</div>
					</div>
					<div className="descriptorsWrapper">
						{this.renderDescriptorsList()}
					</div>
					<div className="descriptorButtons">
						<div className="label">Selected:</div>
						<div className="lock button" onClick={() => { onLock(!lockedSelection, selectedDescriptors);}}>Lock</div>
						<div className="pin button" onClick={() => { onPin(!pinnedSelection, selectedDescriptors);}}>Pin</div>
						<div className="remove button" onClick={() => { onRemove(selectedDescriptors);}}>Remove</div>
					</div>
				</div>
			</div>
		);
	}
}