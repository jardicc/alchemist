import React from "react";
import "./Filters.less";
import { cloneDeep } from "lodash";
import { baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument, baseItemsLayer, baseItemsCustomDescriptor, mainClasses, TBaseItems } from "../../model/properties";
import { IPropertySettings, TDocumentReference, TLayerReference, TGuideReference, TPathReference, TChannelReference, TTargetReference, ITargetReference, TSubTypes, IContentWrapper, TActionSet, TActionItem, TActionCommand, TBaseProperty, THistoryReference, TSnapshotReference, TListenerCategoryReference, IFilterProperty } from "../../model/types";
import { FilterButton, TState } from "../FilterButton/FilterButton";
import { GetList } from "../../classes/GetList";
import { ListenerFilterContainer } from "../ListenerFilter/ListenerFilterContainer";
import SP from "react-uxp-spectrum";

import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { setTargetReferenceAction, setSelectedReferenceTypeAction, setFilterStateAction } from "../../actions/inspectorActions";
import { getPropertySettings, getSelectedTargetReference, getActiveTargetReference, getActiveTargetDocument, getActiveTargetLayer, getActiveReferenceChannel, getActiveReferenceGuide, getActiveReferencePath, getActiveReferenceActionSet, getActiveReferenceActionItem, getActiveReferenceCommand, getActiveReferenceProperty, getActiveReferenceHistory, getActiveReferenceSnapshot, getActiveTargetReferenceListenerCategory, getActiveTargetReferenceForAM, getFilterBySelectedReferenceType } from "../../selectors/inspectorSelectors";
import { Dispatch } from "redux";

export class Filters extends React.Component<TFilters, IState> {
	constructor(props: TFilters) {
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

	private lastDescRef:React.RefObject<Element> = React.createRef();

	public componentDidUpdate=():void=> {
		this.lastDescRef?.current?.scrollIntoView();
	}

	/** refactor into reducer? */
	private onSetSubType = (subType: TSubTypes | "main", value: any) => {
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
			case "timeline":
			case "animation":
			case "animationFrame":
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
					<SP.Menu slot="options" onChange={(e) => { console.log(e); }}>
						{
							list.map(item => (
								<SP.MenuItem
									key={item.value}
									value={item.value}
									selected={this.props.selectedTargetReference === item.value ? true : undefined}
								>{item.label}</SP.MenuItem>
							))
						}
					</SP.Menu>
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

		const foundNotSpecified = !!foundSettings.list.find(p => p.stringID === "notSpecified");
		const defaultList: IFilterProperty<string>[] = foundSettings.list.filter(p => p.type === "default").map(f => ({ label: f.title, value: f.stringID }));
		const hiddenList: IFilterProperty<string>[] = foundSettings.list.filter(p => p.type === "hidden").map(f => ({ label: f.title, value: f.stringID }));
		const firstPartyList: IFilterProperty<string>[] = foundSettings.list.filter(p => p.type === "1st").map(f => ({ label: f.title, value: f.stringID }));
		const optionalList: IFilterProperty<string>[] = foundSettings.list.filter(p => p.type === "optional").map(f => ({ label: f.title, value: f.stringID }));

		const mapFc = (item: IFilterProperty<string>) => (
			<SP.MenuItem
				key={item.value}
				value={item.value}
				selected={activeReferenceProperty.value === item.value ? true : undefined}
			>{item.label}</SP.MenuItem>
		);

		const notSpecified = foundNotSpecified && <SP.MenuItem
			key={"notSpecified"}
			value={"notSpecified"}
			selected={activeReferenceProperty.value === "notSpecified" ? true : undefined}
		>(not specified)</SP.MenuItem>;

		const firstP = !!firstPartyList.length && (
			<>
				<SP.Divider />
				<sp-menu-group size={SP.SpectrumComponetDefaults.defaultSize} >
					<span slot="header">1st Party Only</span>
					{firstPartyList.map(mapFc)}
				</sp-menu-group>
			</>
		);
		
		const hidden = !!hiddenList.length && (
			<>
				<SP.Divider />
				<sp-menu-group size={SP.SpectrumComponetDefaults.defaultSize} >
					<span slot="header">Hidden</span>
					{hiddenList.map(mapFc)}
				</sp-menu-group>
			</>
		);

		const optional = !!optionalList.length && (
			<>
				<SP.Divider />
				<sp-menu-group size={SP.SpectrumComponetDefaults.defaultSize} >
					<span slot="header">Optional</span>
					{optionalList.map(mapFc)}
				</sp-menu-group>
			</>
		);
		const defaultEl = !!defaultList.length && (
			<>
				<SP.Divider />
				<sp-menu-group size={SP.SpectrumComponetDefaults.defaultSize} >
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
						<SP.Menu slot="options" onChange={(e)=>this.onSetSubType("property",e)}>
							{notSpecified}
							{defaultEl}
							{optional}
							{hidden}
							{firstP}
						</SP.Menu>
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
		subType: TSubTypes | "main",
		items: TBaseItems,
		content: { value: string | null | number, filterBy: TState },
	): React.ReactNode => {
		return (
			<div className="filter">
				<div className="label">{label}</div>
				<div className="dropdownWrap">
					<sp-dropdown size={SP.SpectrumComponetDefaults.defaultSize} quiet={true} onMouseDown={() => this.dropdownClick(subType)}>
						<SP.Menu slot="options" onChange={(e) => this.onSetSubType(subType, e)}>
							{
								items.map(item => (
									<SP.MenuItem
										key={item.value}
										value={item.value}
										selected={content.value === item.value ? true : undefined}
									>{item.label}</SP.MenuItem>
								))
							}
						</SP.Menu>
					</sp-dropdown>
					<FilterButton subtype={subType} state={content.filterBy} onClick={(subtype, state) => this.props.onSetFilter(this.props.selectedTargetReference, subtype, state)} />
				</div>
			</div>
		);
	}

	private renderListenerFilter = () => {
		if (this.props.selectedTargetReference !== "listener") {
			return null;
		}
		return <ListenerFilterContainer />;
	}

	public render(): JSX.Element {
		return (
			<div className="filtersWrapper">
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
			</div>
		);
	}
}

interface IState{
	actionCommandsList: IFilterProperty<TActionCommand>[]
	actionItemsList: IFilterProperty<TActionItem>[]
	actionSetsList: IFilterProperty<TActionSet>[]
	channelsList: IFilterProperty<TChannelReference>[]
	documentsList: IFilterProperty<TDocumentReference>[]
	guidesList: IFilterProperty<TGuideReference>[]
	historyList: IFilterProperty<THistoryReference>[]
	layersList: IFilterProperty<TLayerReference>[]
	pathsList: IFilterProperty<TPathReference>[]
	snapshotsList: IFilterProperty<TSnapshotReference>[]
}

type TFilters = IFiltersProps & IFiltersDispatch

export interface IFiltersProps{
	activeReferenceActionItem:IContentWrapper<TActionItem>
	activeReferenceActionSet:IContentWrapper<TActionSet>
	activeReferenceChannel: IContentWrapper<TChannelReference>
	activeReferenceCommand: IContentWrapper<TActionCommand>
	activeReferenceGuide: IContentWrapper<TGuideReference>
	activeReferenceHistory: IContentWrapper<THistoryReference>
	activeReferencePath: IContentWrapper<TPathReference>
	activeReferenceProperty: IContentWrapper<TBaseProperty>
	activeReferenceSnapshot: IContentWrapper<TSnapshotReference>
	activeTargetLayerReference: IContentWrapper<TLayerReference>
	activeTargetReference: ITargetReference | null;
	activeTargetReferenceDocument: IContentWrapper<TDocumentReference>
	activeTargetReferenceForAM: ITargetReference | null;
	activeTargetReferenceListenerCategory: IContentWrapper<TListenerCategoryReference>
	filterBySelectedReferenceType: TState
	propertySettings: IPropertySettings[]
	selectedTargetReference: TTargetReference

}

const mapStateToProps = (state: IRootState): IFiltersProps => ({
	activeReferenceActionItem:getActiveReferenceActionItem(state) as IContentWrapper<TActionItem>,
	activeReferenceActionSet:getActiveReferenceActionSet(state) as IContentWrapper<TActionSet>,
	activeReferenceChannel:getActiveReferenceChannel(state)  as IContentWrapper<TChannelReference>,
	activeReferenceCommand: getActiveReferenceCommand(state) as IContentWrapper<TActionCommand>,
	activeReferenceGuide: getActiveReferenceGuide(state) as IContentWrapper<TGuideReference>,
	activeReferenceHistory: getActiveReferenceHistory(state) as  IContentWrapper<THistoryReference>,
	activeReferencePath: getActiveReferencePath(state) as IContentWrapper<TPathReference>,
	activeReferenceProperty: getActiveReferenceProperty(state) as IContentWrapper<TBaseProperty>,
	activeReferenceSnapshot: getActiveReferenceSnapshot(state) as IContentWrapper<TSnapshotReference>,
	activeTargetLayerReference: getActiveTargetLayer(state) as IContentWrapper<TLayerReference>,
	activeTargetReference: getActiveTargetReference(state),
	activeTargetReferenceDocument: getActiveTargetDocument(state) as IContentWrapper<TDocumentReference>,
	activeTargetReferenceForAM: getActiveTargetReferenceForAM(state),
	activeTargetReferenceListenerCategory: getActiveTargetReferenceListenerCategory(state) as IContentWrapper<TListenerCategoryReference>,
	filterBySelectedReferenceType: getFilterBySelectedReferenceType(state),		
	propertySettings: getPropertySettings(state),
	selectedTargetReference: getSelectedTargetReference(state),
});

interface IFiltersDispatch {
	onSetTargetReference: (arg: ITargetReference) => void
	onSetSelectedReferenceType: (type: TTargetReference) => void
	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main", state: TState) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IFiltersDispatch, Record<string, unknown>> = (dispatch: Dispatch): IFiltersDispatch => ({
	onSetTargetReference: (arg) => dispatch(setTargetReferenceAction(arg)),
	onSetSelectedReferenceType: (type) => dispatch(setSelectedReferenceTypeAction(type)),
	onSetFilter: (type, subType, state) => dispatch(setFilterStateAction(type, subType, state)),
});

export const FiltersContainer = connect<IFiltersProps, IFiltersDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Filters);