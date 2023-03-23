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
	IPropertyGroup, TAllTargetReferences, TChannelReferenceValid,
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
	id: TSubTypes | "main" | "property"
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

	private setProperty = (value: string, toggle: boolean) => {

		const {onSetTargetReference, activeRef} = this.props;
		const activeRefClone = cloneDeep(activeRef);

		if ("properties" in activeRefClone && typeof value === "string") {
			if (toggle) { // support multiGet
				const foundIndex = activeRefClone.properties.indexOf(value);
				if (foundIndex === -1) {
					activeRefClone.properties.push(value);
				} else {
					activeRefClone.properties.splice(foundIndex, 1);
				}
			} else {
				activeRefClone.properties = [value];					
			}
		}

		onSetTargetReference(activeRefClone);
	}



	/** refactor into reducer? */
	private onSetSubType = (subType: TSubTypes | "main" | "property", value: string | number, toggle: boolean) => {

		const {onSetTargetReference, activeRef} = this.props;
		const activeRefClone = cloneDeep(activeRef);
		
		switch (subType) {
			case "main":{
				this.onSetMainCategory(value as TTargetReference);
				return;
			} 
			case "property": {
				this.setProperty(value as string, toggle);
				return;
			}
			// Any chance to make it shorter and keep TS happy? :-/
			case "actionID":
				if (subType in activeRefClone) {
					activeRefClone[subType] = value as number | "none";
				}
				break;
			case "actionSetID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "none";
				}
				break;
			case "channelID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | TChannelReferenceValid  | "selected" | "all";
				}
				break;
			case "commandIndex": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "none";
				}
				break;
			case "documentID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "selected" | "all";
				}
				break;
			case "guideID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "none";
				}
				break;
			case "historyID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "selected";
				}
				break;
			case "layerID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "none";
				}
				break;
			case "pathID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "all" | "vectorMask" | "selected" | "workPath";
				}
				break;
			case "snapshotID": 
				if(subType in activeRefClone){
					activeRefClone[subType] = value as number | "selected";
				}
				break;
			default: {
				const check: never = subType;
				throw new Error("Unhandled subtype: " + check);
			}
		}

		onSetTargetReference(activeRefClone);
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
						id="documentID"
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
				id="layerID"
				items={list}
				filterBy={activeRef.filterLayer}
				content={activeRef.layerID}
			/>
		);
	}

	private renderChannel = (): React.ReactNode | void => {
		const {activeRef} = this.props;
		if (activeRef.type !== "channel") {return;}
		const list:IPropertyItem[] = [...baseItemsChannel, ...this.state.channelsList] as IPropertyItem[];

		return (
			<this.FilterRow
				header="Channel:"
				id="channelID"
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
				id="pathID"
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
				id="actionSetID"
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
				id="actionID"
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
				id="commandIndex"
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
				id="guideID"
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
				id="historyID"
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
				id="snapshotID"
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
		const id = filterProps.id;
		let newContent: (string|number)[];
		if(!Array.isArray(content)) {
			newContent = [content];
		} else {
			newContent = content;
		}
		
		return (
			<AccDrop
				selected={newContent}
				onSelect={(id, value, toggleProperty) => this.onSetSubType(id as TSubTypes, value, !!toggleProperty)}
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

	/**
	 * Document IDs are intentional because we don't always need items for active document
	 */
	private updateList = async (type: TSubTypes | "main" | "property") => {
		console.log("click");
		const {activeRef} = this.props;

		switch (type) {
			case "layerID":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						layersList: GetList.getLayers(activeRef.documentID),
					});
				}
				break;
			case "documentID":
				return this.setState({
					...this.state,
					documentsList: await GetList.getDocuments(),
				});
			case "actionID":
				if (activeRef.type === "actions" && activeRef.actionSetID !== "none") {
					return this.setState({
						...this.state,
						actionItemsList: GetList.getActionItem(activeRef.actionSetID),
					});
				}
				break;
			case "actionSetID":
				return this.setState({
					...this.state,
					actionSetsList: GetList.getActionSets(),
				});
			case "commandIndex":
				if (activeRef.type === "actions" && activeRef.actionID !== "none") {
					return this.setState({
						...this.state,
						actionCommandsList: GetList.getActionCommands(activeRef.actionID),
					});
				}
				break;
			case "channelID":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						channelsList: GetList.getChannels(activeRef.documentID),
					});
				}
				break;
			case "pathID":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						pathsList: GetList.getPaths(activeRef.documentID),
					});
				}
				break;
			case "guideID":
				if ("documentID" in activeRef && activeRef.documentID !== "all") {
					return this.setState({
						...this.state,
						guidesList: GetList.getGuides(activeRef.documentID),
					});
				}
				break;
			case "historyID":
				return this.setState({
					...this.state,
					historyList: GetList.getHistory(),
				});
			case "snapshotID":
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
	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main" | "property", state: TFilterState) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IFiltersDispatch, Record<string, unknown>> = (dispatch: Dispatch): IFiltersDispatch => ({
	onSetTargetReference: (arg) => dispatch(setTargetReferenceAction(arg)),
	onSetSelectedReferenceType: (type) => dispatch(setSelectedReferenceTypeAction(type)),
	onSetFilter: (type, subType, state) => dispatch(setFilterStateAction(type, subType, state)),
});

export const FiltersContainer = connect<IFiltersProps, IFiltersDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Filters);