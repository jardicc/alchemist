import React from "react";
import "./LeftColumn.less";
import { cloneDeep } from "lodash";
import { GetInfo } from "../../classes/GetInfo";
import { DescriptorItemContainer } from "../DescriptorItem/DescriptorItemContainer";
import { baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument, baseItemsLayer, baseItemsCustomDescriptor, mainClasses, baseItemsProperty, TBaseItems } from "../../model/properties";
import { IPropertySettings, IDescriptor, TDocumentReference, TLayerReference, TGuideReference, TPathReference, TChannelReference, TTargetReference, ITargetReference, TSubTypes, IContentWrapper, TActionSet, TActionItem, TActionCommand, TBaseProperty, THistoryReference, TSnapshotReference, ISettings, TListenerCategoryReference } from "../../model/types";
import { FilterButton, TState } from "../FilterButton/FilterButton";
import { IconLockLocked, IconPin, IconTrash, IconCog, IconPencil, IconClipboard, IconPlayIcon, IconList } from "../../../shared/components/icons";
import { GetList } from "../../classes/GetList";
import { app, action } from "../../../shared/imports";
import { ListenerFilterContainer } from "../ListenerFilter/ListenerFilterContainer";
import { Settings } from "../../../listener/classes/Settings";
import { Listener } from "../../../listener/components/Listener";
import { ListenerClass } from "../../classes/Listener";
import photoshop from "photoshop";
import { Descriptor } from "photoshop/dist/types/UXP";
import { ActionDescriptor } from "photoshop/dist/types/photoshop";
import { Helpers } from "../../classes/Helpers";

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
	
	activeTargetReferenceListenerCategory: IContentWrapper<TListenerCategoryReference>
	activeTargetReferenceDocument: IContentWrapper<TDocumentReference>
	activeTargetLayerReference: IContentWrapper<TLayerReference>
	activeReferenceGuide: IContentWrapper<TGuideReference>
	activeReferencePath: IContentWrapper<TPathReference>
	activeReferenceChannel: IContentWrapper<TChannelReference>
	activeReferenceHistory: IContentWrapper<THistoryReference>
	activeReferenceSnapshot: IContentWrapper<TSnapshotReference>
	activeReferenceActionSet:IContentWrapper<TActionSet>
	activeReferenceActionItem:IContentWrapper<TActionItem>
	activeReferenceCommand: IContentWrapper<TActionCommand>
	activeReferenceProperty: IContentWrapper<TBaseProperty>

	settings:ISettings	
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

	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main", state: TState) => void
	
	setListener:(enabled:boolean)=>void
	setAutoInspector: (enabled: boolean) => void
	setSearchTerm(str: string): void
}

export interface IState{
	layersList: IProperty<TLayerReference>[]
	documentsList: IProperty<TDocumentReference>[]
	channelsList: IProperty<TChannelReference>[]
	pathsList: IProperty<TPathReference>[]
	guidesList: IProperty<TGuideReference>[]
	actionSetsList: IProperty<TActionSet>[]
	actionItemsList: IProperty<TActionItem>[]
	actionCommandsList: IProperty<TActionCommand>[]
	historyList: IProperty<THistoryReference>[]
	snapshotsList: IProperty<TSnapshotReference>[]
}

export type TLeftColumn = ILeftColumnProps & ILeftColumnDispatch

export class LeftColumn extends React.Component<TLeftColumn, IState> {
	constructor(props: TLeftColumn) {
		super(props);
		this.state = {
			layersList: [],
			documentsList: [],
			channelsList: [],
			pathsList: [],
			guidesList: [],
			actionSetsList: [],
			actionItemsList: [],
			actionCommandsList: [],
			historyList: [],
			snapshotsList:[],
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

	private renderMainClass = (): React.ReactNode => {
		const { selectedTargetReference, filterBySelectedReferenceType} = this.props;
		return this.buildFilterRow("Type:", "main", mainClasses, {
			value: selectedTargetReference,
			filterBy: filterBySelectedReferenceType
		});
	}
	
	private renderDocument = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		
		switch (selectedTargetReference) {
			case "listener":
			case "customDescriptor":
			case "featureData":
			case "generator":
			case "application":
			case "history":
			case "snapshot":
			case "action":
				return;
		}

		const list = [...baseItemsDocument,...this.state.documentsList];

		const { activeTargetReferenceDocument } = this.props;
		return this.buildFilterRow("Document:","document", list, activeTargetReferenceDocument);
	}
	
	private renderLayer = (): React.ReactNode => {
		const { activeReferenceChannel, activeReferencePath } = this.props;
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

		const list = [...baseItemsLayer,...this.state.layersList];
		
		const { activeTargetLayerReference } = this.props;

		return this.buildFilterRow("Layer:","layer", list, activeTargetLayerReference);
	}

	private renderChannel = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "channel") { return; }
		const list = [...baseItemsChannel,...this.state.channelsList];

		const { activeReferenceChannel } = this.props;
		return this.buildFilterRow("Channel:","channel", list, activeReferenceChannel);
	}
	
	private renderPath = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "path") { return; }
		const list = [...baseItemsPath,...this.state.pathsList];

		const { activeReferencePath } = this.props;

		return this.buildFilterRow("Path:","path", list, activeReferencePath);
	}

	private renderActionSet = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionSet } = this.props;
		const list = [...baseItemsActionCommon, ...this.state.actionSetsList];

		
		return this.buildFilterRow("Action set:","actionset", list, activeReferenceActionSet);
	}

	private renderActionItem = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (!activeReferenceActionSet?.value) { return; }
		const list = [...baseItemsActionCommon, ...this.state.actionItemsList];

		return this.buildFilterRow("Action:","action", list, activeReferenceActionItem);
	}

	private renderCommand = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceCommand, activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (!activeReferenceActionItem?.value || !activeReferenceActionSet?.value) { return; }
		const list = [...baseItemsActionCommon,...this.state.actionCommandsList];

		return this.buildFilterRow("Command:","command", list, activeReferenceCommand);
	}

	private renderGuide = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "guide") { return; }
		const list = [...baseItemsGuide,...this.state.guidesList];

		const { activeReferenceGuide } = this.props;
		return this.buildFilterRow("Guide:","guide", list, activeReferenceGuide);
	}

	private renderHistory = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "history") { return; }
		const list = [...baseItemsDocument,...this.state.historyList];

		const { activeReferenceHistory } = this.props;
		return this.buildFilterRow("History:","history", list, activeReferenceHistory);
	}

	private renderSnapshots = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "snapshot") { return; }
		const list = [...baseItemsDocument,...this.state.snapshotsList];

		const { activeReferenceSnapshot } = this.props;
		return this.buildFilterRow("Snapshots:","snapshot", list, activeReferenceSnapshot);
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
	
	private renderProperty = (): React.ReactNode => {
		const { selectedTargetReference } = this.props;
		const { propertySettings, activeReferenceProperty } = this.props;
		
		switch (selectedTargetReference) {
			case "customDescriptor":
			case "featureData":
			case "generator":
			case "listener":
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

	private dropdownClick = async (type: TSubTypes | "main") => {
		console.log("click");
		const {activeReferenceActionSet,activeReferenceActionItem,activeTargetReferenceDocument } = this.props;

		switch (type) {
			case "layer": 
				return this.setState({...this.state,
					layersList: GetList.getLayers(activeTargetReferenceDocument)
				});
			case "document":
				return this.setState({...this.state,
					documentsList: await GetList.getDocuments()
				});
			case "action":
				return this.setState({...this.state,
					actionItemsList: GetList.getActionItem(parseInt(activeReferenceActionSet.value))
				});
			case "actionset":
				return this.setState({...this.state,
					actionSetsList: GetList.getActionSets()
				});
			case "command":
				return this.setState({...this.state,
					actionCommandsList: GetList.getActionCommand(parseInt(activeReferenceActionItem.value))
				});
			case "channel":
				return this.setState({...this.state,
					channelsList: GetList.getChannels(activeTargetReferenceDocument)
				});
			case "path":
				return this.setState({...this.state,
					pathsList: GetList.getPaths(activeTargetReferenceDocument)
				});
			case "guide":
				return this.setState({...this.state,
					guidesList: GetList.getGuides(activeTargetReferenceDocument)
				});
			case "history":
				return this.setState({...this.state,
					historyList: GetList.getHistory()
				});
			case "snapshot":
				return this.setState({...this.state,
					snapshotsList: GetList.getSnapshots()
				});
		}
	}

	private buildFilterRow = (
		label: string,
		subType: TSubTypes|"main",
		items: TBaseItems,
		content: {value:string|null|number,filterBy:TState}
	): React.ReactNode => {
		return (
			<div className="filter">
				<div className="label">{label}</div>
				<sp-dropdown quiet="true" onMouseDown={()=>this.dropdownClick(subType)}>
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



	private renderListenerFilter = () => {
		if (this.props.selectedTargetReference !== "listener") {
			return null;
		}
		return <ListenerFilterContainer />;
	}

	public inspector = async (event: string, descriptor: any): Promise<void> => {
		const {activeTargetReferenceListenerCategory } = this.props;
		if (event === "select") {
			const startTime = Date.now();
			const desc:ActionDescriptor = {
				_obj: "get",
				_target: descriptor._target,
			};
			const playResult = await photoshop.action.batchPlay([desc], {});
			const result: IDescriptor = {			
				endTime: Date.now(),
				startTime: startTime,
				id: Helpers.uuidv4(),
				locked: false,
				originalData: {
					...playResult
				},
				originalReference: {
					type: "listener",
					data: [{
						subType: "listenerCategory",
						content: activeTargetReferenceListenerCategory // change. I think this has to be hardcoded
					}]
				},
				pinned: false,
				selected: false,
				calculatedReference: desc as any
			};
	
			//this.props.setLastHistoryID;
			this.props.onAddDescriptor(result);
		}
	}

	/**
	 * Listener to be attached to all Photoshop notifications.
	 */
	public listener = async (event: string, descriptor: any): Promise<void> => {
		const {activeTargetReferenceListenerCategory } = this.props;
		//const {collapsed} = this.props.settings;
		console.log(event);
		//const historyName = "test"; //await this.getHistoryState();
		const result: IDescriptor = {			
			endTime: 0,
			startTime: 0,
			id: Helpers.uuidv4(),
			locked: false,
			originalData: {
				_obj: event,
				...descriptor
			},
			originalReference: {
				type: "listener",
				data: [{
					subType: "listenerCategory",
					content: activeTargetReferenceListenerCategory // change. I think this has to be hardcoded
				}]
			},
			pinned: false,
			selected: false,
			calculatedReference: {
				_obj: event,
				...descriptor
			}
		};

		//this.props.setLastHistoryID;
		this.props.onAddDescriptor(result);
	}

	/**
	 * Attaches the simple listener to the app.
	 */
	private attachListener = async () => {
		const { settings: { autoUpdateListener } } = this.props;
		if (autoUpdateListener) {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			ListenerClass.listenerCb = async (event,descriptor) => { };
		} else {
			ListenerClass.listenerCb = this.listener;
		}
		this.props.setListener(!autoUpdateListener);
	}

	private autoInspector = async () => {
		const {settings:{autoUpdateInspector} } = this.props;
		this.props.setAutoInspector(!autoUpdateInspector);
		if (autoUpdateInspector) {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			ListenerClass.inspectorCb = async (event, descriptor) => { };
		} else {
			ListenerClass.inspectorCb = this.inspector;
		}
		this.props.setAutoInspector(!autoUpdateInspector);
	}

	private renderFilters = (): React.ReactNode => {
		return (
			<React.Fragment>
				{this.renderMainClass()}
				{this.renderListenerFilter()}
				{this.renderDocument()}
				{this.renderHistory()}
				{this.renderSnapshots()}
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

	private onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setSearchTerm(e.currentTarget.value);
	}

	private playSelected = () => {
		console.log("a");
	}

	private renameSelected = () => {
		console.log("a");
	}

	private copySelected = () => {
		console.log("a");
	}

	public render(): JSX.Element {
		const { addAllowed, onLock, onPin, onRemove, selectedDescriptors, lockedSelection, pinnedSelection,settings:{autoUpdateListener,autoUpdateInspector,searchTerm} } = this.props;
		return (
			<div className="LeftColumn">
				<div className="oneMore">

				
					<div className="filtersWrapper">
						{this.renderFilters()}
					</div>
					<div className="filterButtons">
						<div className={"add button" + (addAllowed ? " allowed" : " disallowed")} onClick={this.getDescriptor}>+ Add</div>
						<div className={"listenerSwitch button"+(autoUpdateListener ? " activated":" deactivated")} onClick={this.attachListener}>Listener</div>
						<div className={"autoInspectorSwitch button"+(autoUpdateInspector ? " activated":" deactivated")} onClick={this.autoInspector}>Auto Inspector</div>
					</div>
					<div className="search">
						<input placeholder="Search..." onChange={this.onSearch} value={searchTerm || ""} type="text" />
					</div>
					<div className="descriptorsWrapper">
						{this.renderDescriptorsList()}
					</div>
					<div className="descriptorButtons">
						<div className="spread"></div>
						<div className="filter buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconList/></div>
						<div className="settings buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconCog/></div>
						<div className="rename buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconPencil/></div>
						<div className="clipboard buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconClipboard/></div>
						<div className="play buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconPlayIcon/></div>
						<div className="lock buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconLockLocked/></div>
						<div className="pin buttonIcon" onClick={() => { onPin(!pinnedSelection, selectedDescriptors); }}><IconPin/></div>
						<div className="remove buttonIcon" onClick={() => { onRemove(selectedDescriptors); }}><IconTrash /></div>
					</div>
				</div>
			</div>
		);
	}
}