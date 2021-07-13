import React from "react";
import "./LeftColumn.less";
import { cloneDeep } from "lodash";
import { GetInfo, ITargetReferenceAM } from "../../classes/GetInfo";
import { DescriptorItemContainer } from "../DescriptorItem/DescriptorItemContainer";
import { baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument, baseItemsLayer, baseItemsCustomDescriptor, mainClasses, baseItemsProperty, TBaseItems } from "../../model/properties";
import { IPropertySettings, IDescriptor, TDocumentReference, TLayerReference, TGuideReference, TPathReference, TChannelReference, TTargetReference, ITargetReference, TSubTypes, IContentWrapper, TActionSet, TActionItem, TActionCommand, TBaseProperty, THistoryReference, TSnapshotReference, ISettings, TListenerCategoryReference, TSelectDescriptorOperation } from "../../model/types";
import { FilterButton, TState } from "../FilterButton/FilterButton";
import { IconLockLocked, IconPinDown, IconTrash, IconPencil, IconPlayIcon, IconLockUnlocked, IconPinLeft, IconPlus, IconMediaRecord, IconMediaStop } from "../../../shared/components/icons";
import { GetList } from "../../classes/GetList";
import { ListenerFilterContainer } from "../ListenerFilter/ListenerFilterContainer";
import { ListenerClass } from "../../classes/Listener";
import photoshop from "photoshop";
import { Helpers } from "../../classes/Helpers";
import { guessOrinalReference } from "../../classes/guessOriginalReference";
import { ActionDescriptor } from "photoshop/dist/types/photoshop";
import { RawDataConverter } from "../../classes/RawDataConverter";
import {NotificationManager} from "react-notifications";
import { Descriptor } from "photoshop/dist/types/UXP";
import { str as crc } from "crc-32";
import SP from "react-uxp-spectrum";

import { Main } from "../../../shared/classes/Main";
import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { setTargetReferenceAction, addDescriptorAction, setSelectedReferenceTypeAction, clearAction, pinDescAction, removeDescAction, lockDescAction, setFilterStateAction, setListenerAction, setAutoInspectorAction, setSearchTermAction, setRenameModeAction, selectDescriptorAction, setDontShowMarketplaceInfoAction, toggleDescriptorsGroupingAction } from "../../actions/inspectorActions";
import { getTargetReference, getAutoUpdate, getAddAllowed, getSelectedDescriptorsUUID, getPropertySettings, getLockedSelection, getPinnedSelection, getRemovableSelection, getDescriptorsListView, getSelectedTargetReference, getActiveTargetReference, getActiveTargetDocument, getActiveTargetLayer, getActiveReferenceChannel, getActiveReferenceGuide, getActiveReferencePath, getActiveReferenceActionSet, getActiveReferenceActionItem, getActiveReferenceCommand, getActiveReferenceProperty, getActiveReferenceHistory, getActiveReferenceSnapshot, getActiveTargetReferenceListenerCategory, getHasAutoActiveDescriptor, getActiveTargetReferenceForAM, getInspectorSettings, getSelectedDescriptors, getReplayEnabled, getFilterBySelectedReferenceType, getRanameEnabled } from "../../selectors/inspectorSelectors";
import { Dispatch } from "redux";

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
		this.marketplaceDialogRef = React.createRef();
	}

	private marketplaceDialogRef: React.RefObject<any>;
	private lastDescRef:React.RefObject<Element> = React.createRef();

	public componentDidUpdate=():void=> {
		this.lastDescRef?.current?.scrollIntoView();
	}

	/** refactor into reducer? */
	private onSetSubType = (subType: TSubTypes | "main", value: React.ChangeEvent<HTMLSelectElement>) => {
		if (subType === "main") {
			this.onSetMainClass(value);
			return;
		}
		const { onSetTargetReference, activeTargetReference } = this.props;
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
			filterBy: filterBySelectedReferenceType,
		});
	}
	
	private renderDocument = (): React.ReactNode|void => {
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
	
	private renderLayer = (): React.ReactNode|void => {
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

	private renderChannel = (): React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "channel") { return; }
		const list = [...baseItemsChannel,...this.state.channelsList];

		const { activeReferenceChannel } = this.props;
		return this.buildFilterRow("Channel:","channel", list, activeReferenceChannel);
	}
	
	private renderPath = (): React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "path") { return; }
		const list = [...baseItemsPath,...this.state.pathsList];

		const { activeReferencePath } = this.props;

		return this.buildFilterRow("Path:","path", list, activeReferencePath);
	}

	private renderActionSet = (): React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionSet } = this.props;
		const list = [...baseItemsActionCommon, ...this.state.actionSetsList];

		
		return this.buildFilterRow("Action set:","actionset", list, activeReferenceActionSet);
	}

	private renderActionItem = (): React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (!activeReferenceActionSet?.value) { return; }
		const list = [...baseItemsActionCommon, ...this.state.actionItemsList];

		return this.buildFilterRow("Action:","action", list, activeReferenceActionItem);
	}

	private renderCommand = (): React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "action") { return; }
		const { activeReferenceCommand, activeReferenceActionItem, activeReferenceActionSet } = this.props;
		if (!activeReferenceActionItem?.value || !activeReferenceActionSet?.value) { return; }
		const list = [...baseItemsActionCommon,...this.state.actionCommandsList];

		return this.buildFilterRow("Command:","command", list, activeReferenceCommand);
	}

	private renderGuide = ():React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "guide") { return; }
		const list = [...baseItemsGuide,...this.state.guidesList];

		const { activeReferenceGuide } = this.props;
		return this.buildFilterRow("Guide:","guide", list, activeReferenceGuide);
	}

	private renderHistory = (): React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "history") { return; }
		const list = [...baseItemsDocument,...this.state.historyList];

		const { activeReferenceHistory } = this.props;
		return this.buildFilterRow("History:","history", list, activeReferenceHistory);
	}

	private renderSnapshots = (): React.ReactNode|void => {
		const { selectedTargetReference } = this.props;
		if (selectedTargetReference !== "snapshot") { return; }
		const list = [...baseItemsDocument,...this.state.snapshotsList];

		const { activeReferenceSnapshot } = this.props;
		return this.buildFilterRow("Snapshots:","snapshot", list, activeReferenceSnapshot);
	}

	private renderCustomDescriptorCategory = (): React.ReactNode|void => {
		if (this.props.selectedTargetReference !== "customDescriptor") {
			return null;
		}

		const list = [...baseItemsCustomDescriptor];

		return (
			<div className="filter">
				<div className="label">Category:</div>
				<SP.Dropdown quiet={true}>
					<sp-menu slot="options" onClick={(e) => { console.log(e); }}>
						{
							list.map(item => (
								<SP.MenuItem
									key={item.value}
									value={item.value}
									selected={this.props.selectedTargetReference === item.value ? true : null}
								>{item.label}</SP.MenuItem>
							))
						}
					</sp-menu>
				</SP.Dropdown>
			</div>
		);
	}
	
	private renderProperty = (): React.ReactNode|void => {
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
			<SP.MenuItem
				key={item.value}
				value={item.value}
				selected={activeReferenceProperty.value === item.value ? true : null}
			>{item.label}</SP.MenuItem>
		);

		const hidden = hiddenList.length === 0 ? null : (
			<>
				<SP.Divider />
				<sp-menu-group>
					<span slot="header">Hidden</span>
					{hiddenList.map(mapFc)}
				</sp-menu-group>
			</>
		);

		const optional = optionalList.length === 0 ? null : (
			<>
				<SP.Divider />
				<sp-menu-group>
					<span slot="header">Optional</span>
					{optionalList.map(mapFc)}
				</sp-menu-group>
			</>
		);
		const defaultEl = defaultList.length === 0 ? null : (
			<>
				<SP.Divider />
				<sp-menu-group>
					<span slot="header">Default</span>
					{defaultList.map(mapFc)}
				</sp-menu-group>
			</>
		);

		return (
			<div className="filter">
				<div className="label">Property:</div>
				<div className="dropdownWrap">
					<SP.Dropdown quiet={true}>
						<sp-menu slot="options" onClick={(e: React.ChangeEvent<HTMLSelectElement>)=>this.onSetSubType("property",e)}>
							{
								baseItemsProperty.map(item => (
									<SP.MenuItem
										key={item.value}
										value={item.value}
										selected={activeReferenceProperty.value === item.value ? true : null}
									>{item.label}</SP.MenuItem>
								))
							}
							{defaultEl}
							{optional}
							{hidden}
						</sp-menu>
					</SP.Dropdown>
					<FilterButton subtype="property" state={activeReferenceProperty.filterBy} onClick={(subtype,state) =>this.props.onSetFilter(this.props.selectedTargetReference,subtype,state)} />
				</div>
			</div>
		);
	}

	private dropdownClick = async (type: TSubTypes | "main") => {
		console.log("click");
		const {activeReferenceActionSet,activeReferenceActionItem,activeTargetReferenceDocument } = this.props;

		switch (type) {
			case "layer": 
				return this.setState({...this.state,
					layersList: GetList.getLayers(activeTargetReferenceDocument),
				});
			case "document":
				return this.setState({...this.state,
					documentsList: await GetList.getDocuments(),
				});
			case "action":
				return this.setState({...this.state,
					actionItemsList: GetList.getActionItem(parseInt(activeReferenceActionSet.value)),
				});
			case "actionset":
				return this.setState({...this.state,
					actionSetsList: GetList.getActionSets(),
				});
			case "command":
				return this.setState({...this.state,
					actionCommandsList: GetList.getActionCommand(parseInt(activeReferenceActionItem.value)),
				});
			case "channel":
				return this.setState({...this.state,
					channelsList: GetList.getChannels(activeTargetReferenceDocument),
				});
			case "path":
				return this.setState({...this.state,
					pathsList: GetList.getPaths(activeTargetReferenceDocument),
				});
			case "guide":
				return this.setState({...this.state,
					guidesList: GetList.getGuides(activeTargetReferenceDocument),
				});
			case "history":
				return this.setState({...this.state,
					historyList: GetList.getHistory(),
				});
			case "snapshot":
				return this.setState({...this.state,
					snapshotsList: GetList.getSnapshots(),
				});
		}
	}

	private buildFilterRow = (
		label: string,
		subType: TSubTypes|"main",
		items: TBaseItems,
		content: {value:string|null|number,filterBy:TState},
	): React.ReactNode => {
		return (
			<div className="filter">
				<div className="label">{label}</div>
				<div className="dropdownWrap">
					<sp-dropdown quiet={true} onMouseDown={()=>this.dropdownClick(subType)}>
						<sp-menu slot="options" onClick={(e: React.ChangeEvent<HTMLSelectElement>)=>this.onSetSubType(subType,e)}>
							{
								items.map(item => (
									<SP.MenuItem
										key={item.value}
										value={item.value}
										selected={content.value === item.value ? true: null}
									>{item.label}</SP.MenuItem>
								))
							}
						</sp-menu>
					</sp-dropdown>
					<FilterButton subtype={subType} state={content.filterBy} onClick={(subtype,state) =>this.props.onSetFilter(this.props.selectedTargetReference,subtype,state)} />
				</div>
			</div>
		);
	}

	private getDescriptor = async (): Promise<void> => {
		const { activeTargetReferenceForAM } = this.props;
		if (!this.props.addAllowed) {
			return;
		}
		const result = await GetInfo.getAM(activeTargetReferenceForAM);
		if (result === null) {
			NotificationManager.error("Please make sure that item you want to add exists in Photoshop","Failed", 3500);
			return;
		}
		this.props.onAddDescriptor(result);

	}



	private renderListenerFilter = () => {
		if (this.props.selectedTargetReference !== "listener") {
			return null;
		}
		return <ListenerFilterContainer />;
	}

	public autoInspector = async (event: string, descriptor: any): Promise<void> => {
		if (event !== "select") { return; }
		const startTime = Date.now();
		const calculatedReference:ITargetReferenceAM = {
			_obj: "get",
			_target: descriptor._target,
		};
		const playResult = await photoshop.action.batchPlay([calculatedReference], {});
		const originalReference: ITargetReference = guessOrinalReference(calculatedReference._target);

		const result: IDescriptor = {			
			endTime: Date.now(),
			startTime: startTime,
			id: Helpers.uuidv4(),
			locked: false,
			crc: crc(JSON.stringify(playResult)),
			originalData: RawDataConverter.replaceArrayBuffer(playResult),
			originalReference,
			pinned: false,
			renameMode: false,
			selected: false,
			title: GetInfo.generateTitle(originalReference,calculatedReference),
			calculatedReference,
			descriptorSettings: this.props.settings.initialDescriptorSettings,
		};

		//this.props.setLastHistoryID;
		this.props.onAddDescriptor(result);
	}

	/**
	 * Listener to be attached to all Photoshop notifications.
	 */
	public listener = async (event: string, descriptor: any): Promise<void> => {
		if (this.props.settings.neverRecordActionNames.includes(event)) {
			return;
		}

		// delete because it will be added as a first later
		delete descriptor._obj;

		console.log(event);
		const originalReference:ITargetReference = {
			type: "listener",
			data: [{
				subType: "listenerCategory",
				content: {
					filterBy: "off",
					value:"listener",
				},
			}],
		};
		const descWithEvent: ITargetReferenceAM = {
			_obj:event,
			...descriptor,
		};

		const descCrc = crc(JSON.stringify(descWithEvent));
		const originalData = RawDataConverter.replaceArrayBuffer(descWithEvent);

		const result: IDescriptor = {
			endTime: 0,
			startTime: 0,
			crc: descCrc,
			id: Helpers.uuidv4(),
			locked: false,
			originalData,
			originalReference,
			pinned: false,
			selected: false,
			renameMode: false,
			calculatedReference: descWithEvent,
			title: GetInfo.generateTitle(originalReference, descWithEvent),
			descriptorSettings: this.props.settings.initialDescriptorSettings,
		};

		//this.props.setLastHistoryID;
		this.props.onAddDescriptor(result);
	}

	/**
	 * Attaches the simple listener to the app.
	 */
	private attachListener = async () => {
		const { settings:{dontShowMarketplaceInfo,autoUpdateListener}} = this.props;
		if (!dontShowMarketplaceInfo && !autoUpdateListener && !Main.devMode) {
			const res = await this.marketplaceDialogRef.current.uxpShowModal({
				title: "Advice",
				size: {
					width: 400,
				},
			});
			console.log(res);
		}
		
		if (autoUpdateListener) {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			//ListenerClass.listenerCb = async () => { };
			ListenerClass.stopListener();
		} else {
			//ListenerClass.listenerCb = this.listener;
			ListenerClass.startListener(this.listener);
		}
		this.props.setListener(!autoUpdateListener);
	}

	private attachAutoInspector = async () => {
		const {settings:{autoUpdateInspector} } = this.props;
		this.props.setAutoInspector(!autoUpdateInspector);
		if (autoUpdateInspector) {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			ListenerClass.stopInspector();
		} else {
			ListenerClass.startInspector(this.autoInspector);
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
		const { allDescriptors } = this.props;
		return (
			allDescriptors.map((d, index) => (
				<div className="DescriptorItem" key={index} ref={index===allDescriptors.length-1 ? this.lastDescRef as any : null}>
					<DescriptorItemContainer descriptor={d} key={d.id}  />
				</div>
			))
		);
	}

	private onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setSearchTerm(e.currentTarget.value);
	}

	private onPlaySeparated = async () => {
		const toPlay = this.props.selectedDescriptors;
		for await (const item of toPlay) {
			const startTime = Date.now();
			let descriptors:Descriptor;
			try {
				descriptors = await photoshop.action.batchPlay(
					[
						item.calculatedReference as ActionDescriptor,
					], {
						synchronousExecution: false,
					},
				);				
			} catch (e) {
				NotificationManager.error(e.message,"Replay failed", 5000);
				console.error("error");
				return;
			}
			const endTime = Date.now();

			const originalReference: ITargetReference = {
				type: "listener",
				data: [{
					subType: "listenerCategory",
					content: {
						filterBy: "off",
						value: "reply",
					},
				}],
			};

			const result: IDescriptor = {
				endTime,
				startTime,
				id: Helpers.uuidv4(),
				locked: false,
				crc: crc(JSON.stringify(descriptors)),
				originalData: RawDataConverter.replaceArrayBuffer(descriptors),
				originalReference,
				pinned: false,
				selected: false,
				renameMode: false,
				calculatedReference: descriptors,
				title: GetInfo.generateTitle(originalReference, item.calculatedReference as ITargetReferenceAM, true),
				descriptorSettings: this.props.settings.initialDescriptorSettings,
			};

			//this.props.setLastHistoryID;
			this.props.onAddDescriptor(result);
		}
	}

	private rename = () => {
		const { setRenameMode, selectedDescriptorsUUIDs } = this.props;
		if (selectedDescriptorsUUIDs.length) {
			setRenameMode(selectedDescriptorsUUIDs[0], true);			
		}
	}

	private renderMarketplaceDialog = () => {
		const { onSetDontShowMarketplaceInfo } = this.props;

		return (<dialog className="MarketplaceAdvice" ref={this.marketplaceDialogRef}>
			<form>
				<sp-heading>This is marketplace version of Alchemist</sp-heading>
				<sp-body>
					<p>This version will not listen to all events due to limitation in Photoshop but it will try to listen as much as possible. If you know such a event please post it <a href="https://github.com/jardicc/alchemist/issues/3">here</a>.</p>
					<p>Also Alchemist might be unresponsive for several seconds once you click continue. <a href="https://github.com/jardicc/alchemist">Get development version here</a></p>					
				</sp-body>
				<footer>
					<label className="dontShowLabel"><input onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSetDontShowMarketplaceInfo(e.currentTarget.checked)} type="checkbox" />{"Don't show again"}</label>
					{/*<sp-button quiet={true} variant="secondary">Cancel</sp-button>*/}
					<sp-button variant="cta" onClick={() => { this.marketplaceDialogRef.current.close("true"); }}>Continue</sp-button>
				</footer>
			</form>
		</dialog>);
	}

	public render(): JSX.Element {
		const { addAllowed,replayEnabled,onLock, onPin, onRemove,selectedDescriptorsUUIDs,  selectedDescriptors,lockedSelection, pinnedSelection, renameEnabled,settings:{autoUpdateListener,autoUpdateInspector,searchTerm,groupDescriptors} } = this.props;
		return (
			<div className="LeftColumn">
				<div className="oneMore">
					<div className="filtersWrapper">
						{this.renderFilters()}
					</div>


					<div className="search">
						<input placeholder="Search..." onChange={this.onSearch} value={searchTerm || ""} type="text" />
						<SP.Checkbox onChange={this.props.toggleDescGrouping} checked={groupDescriptors === "strict" ? true : undefined}>Group</SP.Checkbox>
					</div>
					<div className="descriptorsWrapper" onClick={()=>this.props.onSelect("none")}>
						{this.renderDescriptorsList()}
					</div>

					<div className="descriptorButtons">
						<div className="spread"></div>

						{/*
							<div className="settings buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconCog/></div>
							<div className="clipboard buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconClipboard/></div>
						*/}
						<div className={"rename buttonIcon " + (renameEnabled ? "allowed" : "disallowed")} onClick={this.rename}><IconPencil /></div>
						<div className={"play buttonIcon " + (replayEnabled ? "" : "disallowed")} onClick={this.onPlaySeparated}><IconPlayIcon /></div>
						<div className={"lock buttonIcon " + ((selectedDescriptors?.length > 0) ? "" : "disallowed")} onClick={() => { onLock(!lockedSelection, selectedDescriptorsUUIDs); }}>
							{selectedDescriptors.some(desc=>desc.locked) ? <IconLockUnlocked />:<IconLockLocked />}
						</div>
						<div className={"pin buttonIcon " + ((selectedDescriptors?.length > 0) ? "" : "disallowed")} onClick={() => { onPin(!pinnedSelection, selectedDescriptorsUUIDs); }}>
							{selectedDescriptors.some(desc=>desc.pinned) ? <IconPinLeft/>:<IconPinDown />}
						</div>
						<div className={"remove buttonIcon " + ((selectedDescriptors?.length > 0) ? "" : "disallowed")} onClick={() => { onRemove(selectedDescriptorsUUIDs); }}><IconTrash /></div>
					</div>
					<div className="filterButtons">
						<div className={"add button" + (addAllowed ? " allowed" : " disallowed")} onClick={this.getDescriptor}><IconPlus /> Add</div>
						<div className={"listenerSwitch button" + (autoUpdateListener ? " activated" : " deactivated")} onClick={this.attachListener}>{autoUpdateListener ? <IconMediaStop /> :<IconMediaRecord />}Listener</div>
						<div className={"autoInspectorSwitch button" + (autoUpdateInspector ? " activated" : " deactivated")} onClick={this.attachAutoInspector}>{autoUpdateInspector ? <IconMediaStop /> :<IconMediaRecord />}Inspector</div>
					</div>
				</div>
				{this.renderMarketplaceDialog()}
			</div>
		);
	}
}

export interface IProperty<T>{
	label: string
	value:T
}

interface IState{
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

type TLeftColumn = ILeftColumnProps & ILeftColumnDispatch

export interface ILeftColumnProps{
	targetReference: ITargetReference[]
	autoUpdate: boolean
	addAllowed:boolean
	selectedDescriptorsUUIDs: string[]
	selectedDescriptors: IDescriptor[]
	propertySettings: IPropertySettings[]
	lockedSelection: boolean
	pinnedSelection: boolean
	removableSelection: boolean
	replayEnabled: boolean
	renameEnabled:boolean
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

const mapStateToProps = (state: IRootState): ILeftColumnProps => ({
	targetReference: getTargetReference(state),
	autoUpdate: getAutoUpdate(state),
	addAllowed: getAddAllowed(state),
	selectedDescriptorsUUIDs: getSelectedDescriptorsUUID(state),
	propertySettings: getPropertySettings(state),
	lockedSelection: getLockedSelection(state),
	pinnedSelection: getPinnedSelection(state),
	removableSelection: getRemovableSelection(state),
	allDescriptors: getDescriptorsListView(state),
	selectedTargetReference: getSelectedTargetReference(state),
	activeTargetReference: getActiveTargetReference(state),
	activeTargetReferenceDocument: getActiveTargetDocument(state) as IContentWrapper<TDocumentReference>,
	activeTargetLayerReference: getActiveTargetLayer(state) as IContentWrapper<TLayerReference>,
	activeReferenceChannel:getActiveReferenceChannel(state)  as IContentWrapper<TChannelReference>,
	activeReferenceGuide: getActiveReferenceGuide(state) as IContentWrapper<TGuideReference>,
	activeReferencePath: getActiveReferencePath(state) as IContentWrapper<TPathReference>,
	activeReferenceActionSet:getActiveReferenceActionSet(state) as IContentWrapper<TActionSet>,
	activeReferenceActionItem:getActiveReferenceActionItem(state) as IContentWrapper<TActionItem>,
	activeReferenceCommand: getActiveReferenceCommand(state) as IContentWrapper<TActionCommand>,
	activeReferenceProperty: getActiveReferenceProperty(state) as IContentWrapper<TBaseProperty>,
	activeReferenceHistory: getActiveReferenceHistory(state) as  IContentWrapper<THistoryReference>,
	activeReferenceSnapshot: getActiveReferenceSnapshot(state) as IContentWrapper<TSnapshotReference>,
	activeTargetReferenceListenerCategory: getActiveTargetReferenceListenerCategory(state) as IContentWrapper<TListenerCategoryReference>,
	hasAutoActiveDescriptor: getHasAutoActiveDescriptor(state),
	activeTargetReferenceForAM: getActiveTargetReferenceForAM(state),
	settings: getInspectorSettings(state),
	selectedDescriptors: getSelectedDescriptors(state),
	replayEnabled: getReplayEnabled(state),
	renameEnabled: getRanameEnabled(state),
	
	filterBySelectedReferenceType: getFilterBySelectedReferenceType(state),		
});

interface ILeftColumnDispatch {
	onSetTargetReference: (arg: ITargetReference) => void
	onAddDescriptor: (descriptor: IDescriptor) => void
	onSetSelectedReferenceType: (type: TTargetReference) => void
	onSelect: (operation: TSelectDescriptorOperation,uuid?: string) => void
	
	onClear: () => void
	onPin: (pin: boolean, uuids: string[]) => void
	onRemove: (uuids: string[]) => void
	onLock: (lock: boolean, uuids: string[]) => void

	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main", state: TState) => void
	
	setListener:(enabled:boolean)=>void
	setAutoInspector: (enabled: boolean) => void
	setSearchTerm:(str: string)=> void
	setRenameMode: (uuid: string, on: boolean) => void
	
	onSetDontShowMarketplaceInfo: (enabled: boolean) => void
	toggleDescGrouping:()=>void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ILeftColumnDispatch, Record<string, unknown>> = (dispatch: Dispatch): ILeftColumnDispatch => ({
	onSetTargetReference: (arg) => dispatch(setTargetReferenceAction(arg)),
	onAddDescriptor: (desc) => dispatch(addDescriptorAction(desc)),
	onSetSelectedReferenceType: (type) => dispatch(setSelectedReferenceTypeAction(type)),
	
	onClear: () => dispatch(clearAction()),
	onPin: (pin, arg) => dispatch(pinDescAction(pin, arg)),
	onRemove: (arg) => dispatch(removeDescAction(arg)),
	onLock: (lock, arg) => dispatch(lockDescAction(lock, arg)),

	onSetFilter: (type, subType, state) => dispatch(setFilterStateAction(type, subType, state)),
	setListener: (enabled) => dispatch(setListenerAction(enabled)),
	setAutoInspector: (enabled) => dispatch(setAutoInspectorAction(enabled)),
	setSearchTerm: (str) => dispatch(setSearchTermAction(str)),
	setRenameMode: (uuid: string, on: boolean) => dispatch(setRenameModeAction(uuid, on)),
	onSelect: (operation: TSelectDescriptorOperation, uuid?: string) => dispatch(selectDescriptorAction(operation, uuid)),
	
	onSetDontShowMarketplaceInfo: (enabled: boolean) => dispatch(setDontShowMarketplaceInfoAction(enabled)),
	toggleDescGrouping:()=>dispatch(toggleDescriptorsGroupingAction()),
});

export const LeftColumnContainer = connect<ILeftColumnProps, ILeftColumnDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(LeftColumn);