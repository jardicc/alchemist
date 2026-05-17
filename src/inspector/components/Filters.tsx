import React from "react";
import "./Filters.less";
import {
	baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument,
	baseItemsLayer, mainClasses,
} from "../model/buildInDropDownValues";
import {TAllTargetReferences, TChannelReferenceValid, TTargetReference} from "../model/types";
import {ListenerFilter} from "./ListenerFilter";

import {useAppDispatch, useAppSelector} from "../../shared/store";
import {
	getActiveRef,
	getFilterBySelectedReferenceType, getPropertiesListForActiveRef,
} from "../selectors/inspectorSelectors";
import {ItemVisibilityButtonWrap} from "./ItemVisibilityButton";
import {FilterRow} from "./FilterRow";
import {inspectorSlice} from "../inspectorSlice";
import {GetList} from "../classes/GetList";

const {setProperty, setSelectedReferenceType, setTargetReference} = inspectorSlice.actions;

export const Filters: React.FC = () => {
	const dispatch = useAppDispatch();
	const activeRef = useAppSelector(getActiveRef);
	const filterBySelectedReferenceType = useAppSelector(getFilterBySelectedReferenceType);
	const activeRefProperties = useAppSelector(getPropertiesListForActiveRef);

	const onSetSelectedReferenceType = (type: TTargetReference) => dispatch(setSelectedReferenceType(type));
	const onSetTargetReference = (arg: Partial<TAllTargetReferences>) => dispatch(setTargetReference(arg));
	const onSetProperty = (value: string | number, toggle: boolean) => dispatch(setProperty(value, toggle));

	const showDocument = activeRef.type === "channel" || activeRef.type === "document" || activeRef.type === "guide" || activeRef.type === "layer" || activeRef.type === "path";
	const showProperties = activeRef.type !== "generator" && activeRef.type !== "listener" && activeRef.type !== "dispatcher" && activeRef.type !== "notifier" && activeRef.type !== "replies";

	// Layer row visibility: only layer/channel/path, and for channel only masks, for path only vector mask
	const showLayer =
		(activeRef.type === "layer") ||
		(activeRef.type === "channel" && (activeRef.channelID === "mask" || activeRef.channelID === "filterMask")) ||
		(activeRef.type === "path" && activeRef.pathID === "vectorMask");

	if (showProperties && !activeRefProperties) {throw new Error("Properties not found");}

	return (
		<>
			<FilterRow
				header="Type:"
				subtype="main"
				icons={true}
				initialItems={mainClasses}
				ItemPostFix={ItemVisibilityButtonWrap}
				doNotCollapse={true}
				filterBy={filterBySelectedReferenceType}
				value={activeRef.type}
				onSelect={(value) => onSetSelectedReferenceType(value as TTargetReference)}
			/>

			{(activeRef.type === "listener" || activeRef.type === "notifier") && <ListenerFilter />}

			{showDocument && (
				<FilterRow
					header="Document:"
					subtype="documentID"
					initialItems={baseItemsDocument(activeRef.type)}
					filterBy={activeRef.filterDoc}
					value={activeRef.documentID}
					onSelect={(value) => onSetTargetReference({documentID: value as number | "selected"})}
					onUpdateList={async () => await GetList.getDocuments()}
				/>
			)}

			{activeRef.type === "historyState" && (
				<FilterRow
					header="History:"
					subtype="historyID"
					initialItems={baseItemsDocument(activeRef.type)}
					filterBy={activeRef.filterHistory}
					value={activeRef.historyID}
					onSelect={(value) => onSetTargetReference({historyID: value as number | "selected"})}
					onUpdateList={async () => GetList.getHistory()}
				/>
			)}

			{activeRef.type === "snapshotClass" && (
				<FilterRow
					header="Snapshots:"
					subtype="snapshotID"
					initialItems={baseItemsDocument(activeRef.type)}
					filterBy={activeRef.filterSnapshot}
					value={activeRef.snapshotID}
					onSelect={(value) => onSetTargetReference({snapshotID: value as number | "selected"})}
					onUpdateList={async () => GetList.getSnapshots()}
				/>
			)}

			{activeRef.type === "guide" && (
				<FilterRow
					header="Guide:"
					subtype="guideID"
					initialItems={baseItemsGuide}
					filterBy={activeRef.filterGuide}
					value={activeRef.guideID}
					onSelect={(value) => onSetTargetReference({guideID: value as number | "none"})}
					onUpdateList={async () => GetList.getGuides(activeRef.documentID)}
				/>
			)}

			{activeRef.type === "channel" && (
				<FilterRow
					header="Channel:"
					subtype="channelID"
					initialItems={baseItemsChannel}
					filterBy={activeRef.filterChannel}
					value={activeRef.channelID}
					onSelect={(value) => onSetTargetReference({channelID: value as number | "selected" | TChannelReferenceValid | "all"})}
					onUpdateList={async () => GetList.getChannels(activeRef.documentID)}
				/>
			)}

			{activeRef.type === "path" && (
				<FilterRow
					header="Path:"
					subtype="pathID"
					initialItems={baseItemsPath}
					filterBy={activeRef.filterPath}
					value={activeRef.pathID}
					onSelect={(value) => onSetTargetReference({pathID: value as number | "selected" | "all" | "workPath" | "vectorMask"})}
					onUpdateList={async () => GetList.getPaths(activeRef.documentID)}
				/>
			)}

			{showLayer && (
				<FilterRow
					header="Layer:"
					subtype="layerID"
					initialItems={baseItemsLayer}
					filterBy={activeRef.filterLayer}
					value={activeRef.layerID}
					onSelect={(value) => onSetTargetReference({layerID: value as number | "selected"})}
					onUpdateList={async () => GetList.getLayers(activeRef.documentID)}
				/>
			)}

			{activeRef.type === "actions" && (
				<FilterRow
					header="Action set:"
					subtype="actionSetID"
					initialItems={baseItemsActionCommon}
					filterBy={activeRef.filterActionSet}
					value={activeRef.actionSetID}
					onSelect={(value) => onSetTargetReference({actionSetID: value as number | "none"})}
					onUpdateList={async () => GetList.getActionSets()}
				/>
			)}

			{activeRef.type === "actions" && activeRef.actionSetID !== "none" && (
				<FilterRow
					header="Action:"
					subtype="actionID"
					initialItems={baseItemsActionCommon}
					filterBy={activeRef.filterAction}
					value={activeRef.actionID}
					onSelect={(value) => onSetTargetReference({actionID: value as number | "none"})}
					onUpdateList={async () => GetList.getActionItem(activeRef.actionSetID as number)}
				/>
			)}

			{activeRef.type === "actions" && activeRef.actionSetID !== "none" && activeRef.actionID !== "none" && (
				<FilterRow
					header="Command:"
					subtype="commandIndex"
					initialItems={baseItemsActionCommon}
					filterBy={activeRef.filterCommand}
					value={activeRef.commandIndex}
					onSelect={(value) => onSetTargetReference({commandIndex: value as number | "none"})}
					onUpdateList={async () => GetList.getActionCommands(activeRef.actionID as number)}
				/>
			)}

			{showProperties && activeRefProperties && (
				<FilterRow
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
			)}
		</>
	);
};
