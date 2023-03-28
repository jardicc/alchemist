import React from "react";
import "./Filters.less";
import {
	baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument,
	baseItemsLayer, mainClasses,
} from "../../model/buildInDropDownValues";
import {IPropertySettings, TAllTargetReferences, TChannelReferenceValid, TTargetReference} from "../../model/types";
import { TFilterState } from "../FilterButton/FilterButton";
import { ListenerFilterContainer } from "../ListenerFilter/ListenerFilterContainer";

import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import {
	getActiveRef,
	getFilterBySelectedReferenceType, getPropertiesListForActiveRef,
} from "../../selectors/inspectorSelectors";
import { Dispatch } from "redux";
import {ItemVisibilityButtonWrap} from "../ItemVisibilityButton/ItemVisibilityButton";
import {FilterRowContainer} from "../FilterRow/FilterRow";
import {setProperty, setSelectedReferenceTypeAction, setTargetReferenceAction} from "../../actions/inspectorActions";
import {cloneDeep} from "lodash";
import {GetList} from "../../classes/GetList";


export class Filters extends React.Component<TFilters, IState> {
	constructor(props: TFilters) {
		super(props);
	}

	private MainCategory = (): JSX.Element => {
		const {activeRef, filterBySelectedReferenceType} = this.props;
		return (
			<FilterRowContainer
				header="Type:"
				subtype="main"
				icons={true}
				initialItems={mainClasses}
				ItemPostFix={ItemVisibilityButtonWrap}
				doNotCollapse={true}
				filterBy={filterBySelectedReferenceType}
				value={activeRef.type}
				onSelect={(value) => this.props.onSetSelectedReferenceType(value as TTargetReference)}
			/>
		);
	}
	
	private Document = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		
		switch (activeRef.type) {
			case "channel":
			case "document":
			case "guide":
			case "layer":
			case "path": {
				return (
					<FilterRowContainer
						header="Document:"
						subtype="documentID"
						initialItems={baseItemsDocument(activeRef.type)}
						filterBy={activeRef.filterDoc}
						value={activeRef.documentID}
						onSelect={(value) => {
							onSetTargetReference({documentID: value as number | "selected"});
						}}
						onUpdateList={async () => await GetList.getDocuments()}
					/>
				);
			}
			default: return null;
		}
	}
	
	private Layer = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		
		// only these three classes support layer in reference
		if ((activeRef.type !== "layer" && activeRef.type !== "channel" && activeRef.type !== "path")) {
			return null;
		}
		// only layer masks are layer related
		if (activeRef.type === "channel" && (activeRef.channelID !== "mask" && activeRef.channelID !== "filterMask")) {
			return null;
		}
		// only vector masks are layer related
		if (activeRef.type === "path" && activeRef.pathID !== "vectorMask") {
			return null;
		}

		
		return (
			<FilterRowContainer
				header="Layer:"
				subtype="layerID"
				initialItems={baseItemsLayer}
				filterBy={activeRef.filterLayer}
				value={activeRef.layerID}
				onSelect={(value) => {
					onSetTargetReference({layerID: value as number | "selected"});
				}}
				onUpdateList={async () => GetList.getLayers(activeRef.documentID)}
			/>
		);
	}

	private Channel = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "channel") {return null;}

		return (
			<FilterRowContainer
				header="Channel:"
				subtype="channelID"
				initialItems={baseItemsChannel}
				filterBy={activeRef.filterChannel}
				value={activeRef.channelID}
				onSelect={(value) => {
					onSetTargetReference({channelID: value as number | "selected" | TChannelReferenceValid | "all" });
				}}
				onUpdateList={async () => GetList.getChannels(activeRef.documentID)}
			/>
		);
	}
	
	private Path = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "path") {return null;}

		return (
			<FilterRowContainer
				header="Path:"
				subtype="pathID"
				initialItems={baseItemsPath}
				filterBy={activeRef.filterPath}
				value={activeRef.pathID}
				onSelect={(value) => {
					onSetTargetReference({pathID:value as number | "selected" | "all" | "workPath" | "vectorMask"});
				}}
				onUpdateList={async () => GetList.getPaths(activeRef.documentID)}
			/>
		);
	}

	private ActionSet = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "actions") {return null;}
		
		return (
			<FilterRowContainer
				header="Action set:"
				subtype="actionSetID"
				initialItems={baseItemsActionCommon}
				filterBy={activeRef.filterActionSet}
				value={activeRef.actionSetID}
				onSelect={(value) => {
					onSetTargetReference({actionSetID: value as number | "none"});
				}}
				onUpdateList={async () => GetList.getActionSets()}
			/>
		);
	}

	private ActionItem = ():JSX.Element|null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "actions" || activeRef.actionSetID === "none") {return null;}

		const id = activeRef.actionSetID;

		return (
			<FilterRowContainer
				header="Action:"
				subtype="actionID"
				initialItems={baseItemsActionCommon}
				filterBy={activeRef.filterAction}
				value={activeRef.actionID}
				onSelect={(value) => {
					onSetTargetReference({actionID: value as number | "none"});
				}}
				onUpdateList={async () => GetList.getActionItem(id)}
			/>
		);
	}

	private Command = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "actions" ||
			activeRef.actionID === "none" ||
			activeRef.actionSetID === "none"
		) {return null;}

		const id = activeRef.actionID;

		return (
			<FilterRowContainer
				header="Command:"
				subtype="commandIndex"
				initialItems={baseItemsActionCommon}
				filterBy={activeRef.filterCommand}
				value={activeRef.commandIndex}
				onSelect={(value) => {
					onSetTargetReference({commandIndex: value as number | "none"});
				}}
				onUpdateList={async () => GetList.getActionCommands(id)}
			/>
		);
	}

	private Guide = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "guide") {return null;}

		return (
			<FilterRowContainer
				header="Guide:"
				subtype="guideID"
				initialItems={baseItemsGuide}
				filterBy={activeRef.filterGuide}
				value={activeRef.guideID}
				onSelect={(value) => {
					onSetTargetReference({guideID: value as number | "none"});
				}}
				onUpdateList={async () => GetList.getGuides(activeRef.documentID)}
			/>
		);
	}

	private History = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "historyState") {return null;}

		return (
			<FilterRowContainer
				header="History:"
				subtype="historyID"
				initialItems={baseItemsDocument(activeRef.type)}
				filterBy={activeRef.filterHistory}
				value={activeRef.historyID}
				onSelect={(value) => {
					onSetTargetReference({historyID: value as number | "selected"});
				}}
				onUpdateList={async () => GetList.getHistory()}
			/>
		);
	}

	private Snapshots = (): JSX.Element | null => {
		const {activeRef, onSetTargetReference} = this.props;
		if (activeRef.type !== "snapshotClass") {return null;}

		return (
			<FilterRowContainer
				header="Snapshots:"
				subtype="snapshotID"
				initialItems={baseItemsDocument(activeRef.type)}
				filterBy={activeRef.filterSnapshot}
				value={activeRef.snapshotID}
				onSelect={(value) => {
					onSetTargetReference({snapshotID: value as number | "selected"});
				}}
				onUpdateList={async () => GetList.getSnapshots()}
			/>
		);
	}
	
	private Property = (): JSX.Element | null => {
		const {activeRef, activeRefProperties, onSetProperty} = this.props;
		
		switch (activeRef.type) {
			case "generator":
			case "listener":
			case "dispatcher":
			case "notifier":
			case "replies":
				return null;
		}
		
		if (!activeRefProperties) {throw new Error("Properties not found");}

		return (
			<FilterRowContainer
				subtype="properties"
				header="Property:"
				items={activeRefProperties.list}
				
				showSearch={true}
				doNotCollapse={true}
				filterBy={activeRef.filterProp}
				value={activeRef.properties}

				supportMultiSelect={true}
				onSelect={onSetProperty}
			/>
		);
	}

	private ListenerFilter = (): JSX.Element | null => {
		switch (this.props.activeRef.type) {
			case "listener":
			case "notifier":
				return <ListenerFilterContainer />;
			default: return null;
		}
	}

	public render(): JSX.Element {
		return (
			<>
				<this.MainCategory />
				<this.ListenerFilter />
				<this.Document />
				<this.History />
				<this.Snapshots />
				<this.Guide />
				<this.Channel />
				<this.Path />
				<this.Layer />
				<this.ActionSet />
				<this.ActionItem />
				<this.Command />
				<this.Property />
			</>
		);
	}
}

interface IState{
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
	onSetSelectedReferenceType: (type: TTargetReference) => void
	onSetTargetReference: (arg: Partial<TAllTargetReferences>) => void
	onSetProperty: (value: string | number, toggle: boolean) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IFiltersDispatch, Record<string, unknown>> = (dispatch: Dispatch): IFiltersDispatch => ({
	onSetSelectedReferenceType: (type) => dispatch(setSelectedReferenceTypeAction(type)),
	onSetTargetReference: (arg) => dispatch(setTargetReferenceAction(arg)),
	onSetProperty: (value,toggle) => dispatch(setProperty(value,toggle)),
});

export const FiltersContainer = connect<IFiltersProps, IFiltersDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Filters);