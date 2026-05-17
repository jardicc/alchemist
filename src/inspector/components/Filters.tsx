import React from "react";
import "./Filters.less";
import {
	baseItemsActionCommon, baseItemsGuide, baseItemsChannel, baseItemsPath, baseItemsDocument,
	baseItemsLayer, mainClasses,
} from "../model/buildInDropDownValues";
import {IPropertySettings, TAllTargetReferences, TChannelReferenceValid, TTargetReference} from "../model/types";
import {TFilterState} from "./FilterButton";
import {ListenerFilter} from "./ListenerFilter";

import {useAppDispatch, useAppSelector} from "../../shared/store";
import {
	getActiveRef,
	getFilterBySelectedReferenceType, getPropertiesListForActiveRef,
} from "../selectors/inspectorSelectors";
import {ItemVisibilityButtonWrap} from "./ItemVisibilityButton";
import {FilterRow} from "./FilterRow";
import {setProperty, setSelectedReferenceTypeAction, setTargetReferenceAction} from "../actions/inspectorActions";
import {cloneDeep} from "lodash";
import {GetList} from "../classes/GetList";

export const Filters: React.FC = () => {
	const dispatch = useAppDispatch();
	const activeRef = useAppSelector(getActiveRef);
	const filterBySelectedReferenceType = useAppSelector(getFilterBySelectedReferenceType);
	const activeRefProperties = useAppSelector(getPropertiesListForActiveRef);
	const onSetSelectedReferenceType = (type: TTargetReference) => dispatch(setSelectedReferenceTypeAction(type));
	const onSetTargetReference = (arg: Partial<TAllTargetReferences>) => dispatch(setTargetReferenceAction(arg));
	const onSetProperty = (value: string | number, toggle: boolean) => dispatch(setProperty(value, toggle));
	const MainCategory = (): JSX.Element => {
		return (
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
		);
	};

	const Document = (): JSX.Element | null => {
		switch (activeRef.type) {
			case "channel":
			case "document":
			case "guide":
			case "layer":
			case "path": {
				return (
					<FilterRow
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
	};

	const Layer = (): JSX.Element | null => {
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
			<FilterRow
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
	};

	const Channel = (): JSX.Element | null => {
		if (activeRef.type !== "channel") {return null;}

		return (
			<FilterRow
				header="Channel:"
				subtype="channelID"
				initialItems={baseItemsChannel}
				filterBy={activeRef.filterChannel}
				value={activeRef.channelID}
				onSelect={(value) => {
					onSetTargetReference({channelID: value as number | "selected" | TChannelReferenceValid | "all"});
				}}
				onUpdateList={async () => GetList.getChannels(activeRef.documentID)}
			/>
		);
	};

	const Path = (): JSX.Element | null => {
		if (activeRef.type !== "path") {return null;}

		return (
			<FilterRow
				header="Path:"
				subtype="pathID"
				initialItems={baseItemsPath}
				filterBy={activeRef.filterPath}
				value={activeRef.pathID}
				onSelect={(value) => {
					onSetTargetReference({pathID: value as number | "selected" | "all" | "workPath" | "vectorMask"});
				}}
				onUpdateList={async () => GetList.getPaths(activeRef.documentID)}
			/>
		);
	};

	const ActionSet = (): JSX.Element | null => {
		if (activeRef.type !== "actions") {return null;}

		return (
			<FilterRow
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
	};

	const ActionItem = (): JSX.Element | null => {
		if (activeRef.type !== "actions" || activeRef.actionSetID === "none") {return null;}

		const id = activeRef.actionSetID;

		return (
			<FilterRow
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
	};

	const Command = (): JSX.Element | null => {
		if (activeRef.type !== "actions" ||
			activeRef.actionID === "none" ||
			activeRef.actionSetID === "none"
		) {return null;}

		const id = activeRef.actionID;

		return (
			<FilterRow
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
	};

	const Guide = (): JSX.Element | null => {
		if (activeRef.type !== "guide") {return null;}

		return (
			<FilterRow
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
	};

	const History = (): JSX.Element | null => {
		if (activeRef.type !== "historyState") {return null;}

		return (
			<FilterRow
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
	};

	const Snapshots = (): JSX.Element | null => {
		if (activeRef.type !== "snapshotClass") {return null;}

		return (
			<FilterRow
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
	};

	const Property = (): JSX.Element | null => {
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
		);
	};

	const ListenerFilterSection = (): JSX.Element | null => {
		switch (activeRef.type) {
			case "listener":
			case "notifier":
				return <ListenerFilter />;
			default: return null;
		}
	};

	return (
		<>
			<MainCategory />
			<ListenerFilterSection />
			<Document />
			<History />
			<Snapshots />
			<Guide />
			<Channel />
			<Path />
			<Layer />
			<ActionSet />
			<ActionItem />
			<Command />
			<Property />
		</>
	);
};

export interface IFiltersProps {
	activeRef: TAllTargetReferences;
	filterBySelectedReferenceType: TFilterState
	activeRefProperties: IPropertySettings | undefined
}
