import React from "react";
import "./LeftColumn.less";
import { cloneDeep } from "lodash";
import { GetInfo } from "../../classes/GetInfo";
import { DescriptorItemContainer } from "../DescriptorItem/DescriptorItemContainer";
import { baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument, baseItemsLayer, baseItemsCustomDescriptor, mainClasses, baseItemsProperty, TBaseItems } from "../../model/properties";
import { IPropertySettings, IDescriptor, TDocumentReference, TLayerReference, TGuideReference, TPathReference, TChannelReference, TTargetReference, ITargetReference, TSubTypes, IContentWrapper, TActionSet, TActionItem, TActionCommand, TBaseProperty, TFilterContent } from "../../model/types";
import { FilterButton, TState } from "../FilterButton/FilterButton";
import { IconLockLocked, IconPin, IconTrash } from "../../../shared/components/icons";
import { GetList } from "../../classes/GetList";

export interface IProperty<T>{
	label: string
	value:T
}

export interface ILeftColumnProps{
	targetReference: ITargetReference[]
	autoUpdate: boolean
	addAllowed:boolean
	selectedDescriptors: string[]
	propertySettings: IPropertySettings[]
	lockedSelection: boolean
	pinnedSelection: boolean
	removableSelection: boolean
	allDescriptors: IDescriptor[]

	activeTargetReferenceForAM: ITargetReference | null;
	activeTargetReference: ITargetReference | null;
	selectedTargetReference: TTargetReference
	filterBySelectedReferenceType: TState
	
	activeTargetReferenceDocument: IContentWrapper<TDocumentReference>
	activeTargetLayerReference: IContentWrapper<TLayerReference>
	activeReferenceGuide: IContentWrapper<TGuideReference>
	activeReferencePath: IContentWrapper<TPathReference>
	activeReferenceChannel: IContentWrapper<TChannelReference>
	activeReferenceActionSet:IContentWrapper<TActionSet>
	activeReferenceActionItem:IContentWrapper<TActionItem>
	activeReferenceCommand: IContentWrapper<TActionCommand>
	activeReferenceProperty: IContentWrapper<TBaseProperty>
	
	hasAutoActiveDescriptor:boolean
}

export interface ILeftColumnDispatch {
	onSetTargetReference: (arg: ITargetReference) => void
	onAddDescriptor: (descriptor: IDescriptor) => void
	onSetSelectedReferenceType: (type: TTargetReference) => void
	
	onClear: () => void
	onPin: (pin: boolean, uuids: string[]) => void
	onRemove: (uuids: string[]) => void
	onLock: (lock: boolean, uuids: string[]) => void

	onSetFilter:(type: TTargetReference,subType: TSubTypes|"main",state: TState)=>void
}

export type TLeftColumn = ILeftColumnProps & ILeftColumnDispatch

export class LeftColumn extends React.Component<TLeftColumn> {
	constructor(props: TLeftColumn) {
		super(props);
		this.state = {
		};
	}

	/** refactor into reducer? */
	private onSetSubType = (subType: TSubTypes | "main", value: React.ChangeEvent<HTMLSelectElement>) => {
		if (subType === "main") {
			this.onSetMainClass(value);
			return;
		}
		const { onSetTargetReference, activeTargetReference, } = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found) {
			const content = found?.data?.find(i => i.subType === subType)?.content;
			if (content) {
				content.value = value.target.value;
				onSetTargetReference(found);
			}
		}
	}

	private onSetMainClass = (value: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onSetSelectedReferenceType(value.target.value as TTargetReference);
	}

	private renderActionSet = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionSet } = this.props;
		const list = [...baseItemsActionCommon, ...GetList.getActionSets()];

		
		return this.buildFilterRow("Action set:","actionset", list, activeReferenceActionSet);
	}

	private renderActionItem = (): React.ReactNode => {
		console.log("actionItem");
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (!activeReferenceActionSet?.value) { return; }
		const list = [...baseItemsActionCommon, ...GetList.getActionItem(parseInt(activeReferenceActionSet.value))];

		return this.buildFilterRow("Action:","action", list, activeReferenceActionItem);
	}

	private renderCommand = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceCommand, activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (!activeReferenceActionItem?.value || !activeReferenceActionSet?.value) { return; }
		const list = [...baseItemsActionCommon,...GetList.getActionCommand(parseInt(activeReferenceActionItem.value))];

		return this.buildFilterRow("Command:","command", list, activeReferenceCommand);
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
				selected={activeReferenceProperty.value === item.value ? "selected" : null}
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
					<sp-menu slot="options" onClick={(e: React.ChangeEvent<HTMLSelectElement>)=>this.onSetSubType("property",e)}>
						{
							baseItemsProperty.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={activeReferenceProperty.value === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
						{defaultEl}
						{optional}
						{hidden}
					</sp-menu>
				</sp-dropdown>
				<FilterButton subtype="property" state={activeReferenceProperty.filterBy} onClick={(subtype,state) =>this.props.onSetFilter(this.props.selectedTargetReference,subtype,state)} />
			</div>
		);
	}
	private renderGuide = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "guide") { return; }
		const list = [...baseItemsGuide];

		const { activeReferenceGuide } = this.props;
		return this.buildFilterRow("Guide:","guide", list, activeReferenceGuide);
	}
	private renderChannel = (): React.ReactNode => {
		const { selectedTargetReference,activeTargetReferenceDocument } = this.props;
		if (selectedTargetReference !== "channel") { return; }
		const list = [...baseItemsChannel,...GetList.getChannels(activeTargetReferenceDocument)];

		const { activeReferenceChannel } = this.props;
		return this.buildFilterRow("Channel:","channel", list, activeReferenceChannel);
	}

	private renderPath = (): React.ReactNode => {
		const { selectedTargetReference,activeTargetReferenceDocument } = this.props;
		if (selectedTargetReference !== "path") { return; }
		const list = [...baseItemsPath,...GetList.getPaths(activeTargetReferenceDocument)];

		const { activeReferencePath } = this.props;

		return this.buildFilterRow("Path:","path", list, activeReferencePath);
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

		const list = [...baseItemsDocument,...GetList.getDocuments()];

		const { activeTargetReferenceDocument } = this.props;
		return this.buildFilterRow("Document:","document", list, activeTargetReferenceDocument);
	}

	private renderLayer = (): React.ReactNode => {
		const { activeReferenceChannel, activeReferencePath, activeTargetReferenceDocument } = this.props;
		const { selectedTargetReference } = this.props;
		
		if ((selectedTargetReference === "layer" || selectedTargetReference === "channel" || selectedTargetReference === "path") === false) {
			return;
		}
		// only layer masks are layer related
		if (selectedTargetReference === "channel" && (activeReferenceChannel.value !== "mask" && activeReferenceChannel.value !== "filterMask")) {
			return;
		}
		// only vector masks are layer related
		if (selectedTargetReference === "path" && activeReferencePath.value !== "vectorMask") {
			return;
		}

		const list = [...baseItemsLayer,...GetList.getLayers(activeTargetReferenceDocument)];
		
		const { activeTargetLayerReference } = this.props;

		return this.buildFilterRow("Layer:","layer", list, activeTargetLayerReference);
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
		const { selectedTargetReference, filterBySelectedReferenceType} = this.props;
		return this.buildFilterRow("Type:", "main", mainClasses, {
			value: selectedTargetReference,
			filterBy: filterBySelectedReferenceType
		});
	}

	private buildFilterRow = (
		label: string,
		subType: TSubTypes|"main",
		items: TBaseItems,
		content: {value:string|null|number,filterBy:TState}
	): React.ReactNode => {
		console.log("Filter:", label, subType, items, content);
		return (
			<div className="filter">
				<div className="label">{label}</div>
				<sp-dropdown quiet="true" onClick={() => { console.log("click"); }}>
					<sp-menu slot="options" onClick={(e: React.ChangeEvent<HTMLSelectElement>)=>this.onSetSubType(subType,e)}>
						{
							items.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={content.value === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
				<FilterButton subtype={subType} state={content.filterBy} onClick={(subtype,state) =>this.props.onSetFilter(this.props.selectedTargetReference,subtype,state)} />
			</div>
		);
	}

	private getDescriptor = async (): Promise<void> => {
		const { activeTargetReferenceForAM } = this.props;
		if (!this.props.addAllowed) {
			return;
		}
		const result = await GetInfo.getAM(activeTargetReferenceForAM);
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
		const { allDescriptors, hasAutoActiveDescriptor } = this.props;
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
						<div className="spread"></div>
						<div className="lock buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconLockLocked/></div>
						<div className="pin buttonIcon" onClick={() => { onPin(!pinnedSelection, selectedDescriptors); }}><IconPin/></div>
						<div className="remove buttonIcon" onClick={() => { onRemove(selectedDescriptors); }}><IconTrash /></div>
					</div>
				</div>
			</div>
		);
	}
}