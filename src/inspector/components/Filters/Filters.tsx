import React, {ComponentType} from "react";
import "./Filters.less";
import { cloneDeep } from "lodash";
import {
	baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument,
	baseItemsLayer, mainClasses,
} from "../../model/properties";
import {
	IPropertySettings, TDocumentReference, TLayerReference, TGuideReference, TPathReference,
	TChannelReference, TTargetReference, TSubTypes, TActionSet, TActionItem, TActionCommand,
	THistoryReference, TSnapshotReference, IFilterProperty, IPropertyItem,
	IPropertyGroup, TAllTargetReferences,
} from "../../model/types";
import { FilterButton, TFilterState } from "../FilterButton/FilterButton";
import { GetList } from "../../classes/GetList";
import { ListenerFilterContainer } from "../ListenerFilter/ListenerFilterContainer";

import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { setTargetReferenceAction, setSelectedReferenceTypeAction, setFilterStateAction } from "../../actions/inspectorActions";
import {
	getActiveRef,
	getFilterBySelectedReferenceType, getPropertiesListForActiveRef,
} from "../../selectors/inspectorSelectors";
import { Dispatch } from "redux";
import {AccDrop, IAccDropPostFixProps} from "../AccDrop/AccDrop";
import {ItemVisibilityButtonWrap} from "../ItemVisibilityButton/ItemVisibilityButton";


interface IFilterRowProps{
	id: string
	items: (IPropertyItem | IPropertyGroup)[]
	icons? :boolean
	header: string | React.ReactElement
	filterBy: TFilterState
	content: string|number|string[]
	showSearch?: boolean
	ItemPostFix?:ComponentType<IAccDropPostFixProps>
	doNotCollapse?: boolean
	supportMultiSelect?:boolean
}

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
			snapshotsList: [],
		};
	}

	/** refactor into reducer? */
	private onSetSubType = (subType: TSubTypes | "main", value: TTargetReference, toggle:boolean) => {
		if (subType === "main") {
			this.onSetMainCategory(value);
			return;
		}
		const {onSetTargetReference, activeRef: activeTargetReference} = this.props;
		if (!activeTargetReference) {
			return;
		}
		const activeRefClone = cloneDeep(activeTargetReference);
		
		const subTypeData = activeRefClone?.data?.find(i => i.subType === subType);
		if (subTypeData) {
			if (subTypeData.subType === "property") {
				const {content} = subTypeData;
				if (toggle) { // support multiGet
					const foundIndex = content.value.indexOf(value);
					if (foundIndex === -1) {
						content.value.push(value);
					} else {
						content.value.splice(foundIndex, 1);
					}
				} else {
					content.value = [value];					
				}
			} else {
				subTypeData.content.value = value;
			}
			onSetTargetReference(activeRefClone);
		}
	}

	private onSetMainCategory = (value: TTargetReference) => {
		this.props.onSetSelectedReferenceType(value);
	}

	private renderMainCategory = (): React.ReactNode => {
		const {activeRef, filterBySelectedReferenceType} = this.props;
		return (
			<this.FilterRow
				header="Type:"
				id="main"
				icons={true}
				items={mainClasses}
				ItemPostFix={ItemVisibilityButtonWrap}
				doNotCollapse={true}
				filterBy={filterBySelectedReferenceType}
				content={activeRef.type}
			/>
		);
	}
	
	private renderDocument = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		
		switch (activeRef.type) {
			case "channel":
			case "document":
			case "guide":
			case "layer":
			case "path": {
				const list = [...baseItemsDocument, ...this.state.documentsList];
				
				return (
					<this.FilterRow
						header="Document:"
						id="document"
						items={list}
						filterBy={activeRef.filterDoc}
						content={activeRef.documentID}
					/>
				);
			}
		}
	}
	
	private renderLayer = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		
		// only these three classes support layer in reference
		if ((activeRef.type !== "layer" && activeRef.type !== "channel" && activeRef.type !== "path")) {
			return;
		}
		// only layer masks are layer related
		if (activeRef.type === "channel" && (activeRef.channelID !== "mask" && activeRef.channelID !== "filterMask")) {
			return;
		}
		// only vector masks are layer related
		if (activeRef.type === "path" && activeRef.pathID !== "vectorMask") {
			return;
		}

		const list = [...baseItemsLayer, ...this.state.layersList];
		
		return (
			<this.FilterRow
				header="Layer:"
				id="layer"
				items={list}
				filterBy={activeRef.filterLayer}
				content={activeRef.layerID}
			/>
		);
	}

	private renderChannel = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "channel") {return;}
		const list = [...baseItemsChannel, ...this.state.channelsList];

		return (
			<this.FilterRow
				header="Channel:"
				id="channel"
				items={list}
				filterBy={activeRef.filterChannel}
				content={activeRef.channelID}
			/>
		);
	}
	
	private renderPath = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "path") {return;}
		const list = [...baseItemsPath, ...this.state.pathsList];

		return (
			<this.FilterRow
				header="Path:"
				id="path"
				items={list}
				filterBy={activeRef.filterPath}
				content={activeRef.pathID}
			/>
		);
	}

	private renderActionSet = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "actions") {return;}
		const list = [...baseItemsActionCommon, ...this.state.actionSetsList];

		
		return (
			<this.FilterRow
				header="Action set:"
				id="actionset"
				items={list}
				filterBy={activeRef.filterAction}
				content={activeRef.actionSetID}
			/>
		);
	}

	private renderActionItem = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "actions" || activeRef.actionSetID === "none") {return;}
		const list = [...baseItemsActionCommon, ...this.state.actionItemsList];

		return (
			<this.FilterRow
				header="Action:"
				id="action"
				items={list}
				filterBy={activeRef.filterAction}
				content={activeRef.actionID}
			/>
		);
	}

	private renderCommand = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "actions" ||
			activeRef.actionID === "none" ||
			activeRef.actionSetID === "none"
		) {return;}
		const list = [...baseItemsActionCommon, ...this.state.actionCommandsList];

		return (
			<this.FilterRow
				header="Command:"
				id="command"
				items={list}
				filterBy={activeRef.filterCommand}
				content={activeRef.commandIndex}
			/>
		);
	}

	private renderGuide = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "guide") {return;}
		const list = [...baseItemsGuide, ...this.state.guidesList];

		return (
			<this.FilterRow
				header="Guide:"
				id="guide"
				items={list}
				filterBy={activeRef.filterGuide}
				content={activeRef.guideID}
			/>
		);
	}

	private renderHistory = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "historyState") {return;}
		const list = [...baseItemsDocument, ...this.state.historyList];

		return (
			<this.FilterRow
				header="History:"
				id="history"
				items={list}
				filterBy={activeRef.filterHistory}
				content={activeRef.historyID}
			/>
		);
	}

	private renderSnapshots = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "snapshotClass") {return;}
		const list = [...baseItemsDocument, ...this.state.snapshotsList];

		return (
			<this.FilterRow
				header="Snapshots:"
				id="snapshot"
				items={list}
				filterBy={activeRef.filterSnapshot}
				content={activeRef.snapshotID}
			/>
		);
	}
	
	private renderProperty = (): React.ReactNode | void => {
		const {activeRef, activeRefProperties} = this.props;
		
		switch (activeRef.type) {
			case "generator":
			case "listener":
			case "dispatcher":
			case "notifier":
			case "replies":
				return;
		}
		
		if (!activeRefProperties) {throw new Error("Properties not found");}

		return (
			<this.FilterRow
				id="property"
				header="Property:"
				items={activeRefProperties.list}
				
				showSearch={true}
				doNotCollapse={true}
				filterBy={activeRef.filterProp}
				content={activeRef.properties}

				supportMultiSelect={true}
			/>
		);
	}

	private FilterRow = (filterProps: IFilterRowProps): JSX.Element => {
		const {content, filterBy} = filterProps;
		const id = filterProps.id as TSubTypes | "main";
		let newContent: string[];
		if(!Array.isArray(content)) {
			newContent = [content.toString()];
		} else {
			newContent = content;
		}
		newContent = newContent.map(c => c.toString());
		
		return (
			<AccDrop
				selected={newContent}
				onSelect={(id, value, toggleProperty) => this.onSetSubType(id as TSubTypes, value as TTargetReference, !!toggleProperty)}
				onHeaderClick={() => this.updateList(id)}
				headerPostFix={
					<FilterButton
						subtype={id}
						state={filterBy}
						onClick={(subtype, state, e) => {
							this.props.onSetFilter(this.props.activeRef.type, subtype, state);
							e.stopPropagation();
						}}
					/>
				}
				{...filterProps}
			/>
		);
	}

	private renderListenerFilter = (): JSX.Element | void => {
		switch (this.props.activeRef.type) {
			case "listener":
			case "notifier":
				return <ListenerFilterContainer />;
		}
	}

	public render(): JSX.Element {
		return (
			<>
				{this.renderMainCategory()}
				{this.renderListenerFilter()}
				{this.renderDocument()}
				{this.renderHistory()}
				{this.renderSnapshots()}
				{this.renderGuide()}
				{this.renderChannel()}
				{this.renderPath()}
				{this.renderLayer()}
				{this.renderActionSet()}
				{this.renderActionItem()}
				{this.renderCommand()}
				{this.renderProperty()}
			</>
		);
	}

	private updateList = async (type: TSubTypes | "main") => {
		console.log("click");
		const {activeRef} = this.props;

		switch (type) {
			case "layer":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						layersList: GetList.getLayers(activeRef.documentID),
					});
				}
				break;
			case "document":
				return this.setState({
					...this.state,
					documentsList: await GetList.getDocuments(),
				});
			case "action":
				if ("actionID" in activeRef && activeRef.actionID !== "none") {
					return this.setState({
						...this.state,
						actionItemsList: GetList.getActionItem(activeRef.actionID),
					});
				}
				break;
			case "actionset":
				return this.setState({
					...this.state,
					actionSetsList: GetList.getActionSets(),
				});
			case "command":
				if ("commandIndex" in activeRef && activeRef.commandIndex !== "none") {
					return this.setState({
						...this.state,
						actionCommandsList: GetList.getActionCommand(activeRef.commandIndex),
					});
				}
				break;
			case "channel":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						channelsList: GetList.getChannels(activeRef.documentID),
					});
				}
				break;
			case "path":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						pathsList: GetList.getPaths(activeRef.documentID),
					});
				}
				break;
			case "guide":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						guidesList: GetList.getGuides(activeRef.documentID),
					});
				}
				break;
			case "history":
				return this.setState({
					...this.state,
					historyList: GetList.getHistory(),
				});
			case "snapshot":
				return this.setState({
					...this.state,
					snapshotsList: GetList.getSnapshots(),
				});
		}
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
	activeRef: TAllTargetReferences;
	filterBySelectedReferenceType: TFilterState
	activeRefProperties: IPropertySettings | undefined

}

const mapStateToProps = (state: IRootState): IFiltersProps => ({

	activeRef: getActiveRef(state),
	filterBySelectedReferenceType: getFilterBySelectedReferenceType(state),		
	activeRefProperties: getPropertiesListForActiveRef(state),
});

interface IFiltersDispatch {
	onSetTargetReference: (arg: TAllTargetReferences) => void
	onSetSelectedReferenceType: (type: TTargetReference) => void
	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main", state: TFilterState) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IFiltersDispatch, Record<string, unknown>> = (dispatch: Dispatch): IFiltersDispatch => ({
	onSetTargetReference: (arg) => dispatch(setTargetReferenceAction(arg)),
	onSetSelectedReferenceType: (type) => dispatch(setSelectedReferenceTypeAction(type)),
	onSetFilter: (type, subType, state) => dispatch(setFilterStateAction(type, subType, state)),
});

export const FiltersContainer = connect<IFiltersProps, IFiltersDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Filters);