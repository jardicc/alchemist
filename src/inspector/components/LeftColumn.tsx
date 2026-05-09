import React from "react";
import "./LeftColumn.less";
import {GetInfo, ITargetReferenceAM} from "../classes/GetInfo";
import {DescriptorItemContainer} from "./DescriptorItemContainer";
import {IDescriptor, IRefListener, IRefNotifier, IRefReplies, ISettings, TAllTargetReferences, TSelectDescriptorOperation} from "../model/types";
import {IconLockLocked, IconPinDown, IconTrash, IconPencil, IconPlayIcon, IconLockUnlocked, IconPinLeft, IconPlus, IconMediaRecord, IconMediaStop, IconClipboard} from "../../shared/components/icons";
import {ListenerClass} from "../classes/Listener";
import photoshop from "photoshop";
import {replayDescriptor} from "../classes/Helpers";
import {guessOriginalReference} from "../classes/guessOriginalReference";
import {RawDataConverter} from "../classes/RawDataConverter";
import {NotificationManager} from "react-notifications";
import {str as crc} from "crc-32";
import SP from "react-uxp-spectrum";

import {Main} from "../../shared/classes/Main";
import {MapDispatchToPropsFunction, connect} from "react-redux";
import {IRootState} from "../../shared/store";
import {
	addDescriptorAction, clearAction, pinDescAction, removeDescAction, lockDescAction,
	setListenerAction, setAutoInspectorAction, setSearchTermAction, setRenameModeAction,
	selectDescriptorAction, setDontShowMarketplaceInfoAction, toggleDescriptorsGroupingAction,
	clearViewAction, importItemsAction, setSpyAction,
} from "../actions/inspectorActions";
import {
	getTargetReference, getAutoUpdate, getAddAllowed, getSelectedDescriptorsUUID,
	getLockedSelection, getPinnedSelection, getRemovableSelection, getDescriptorsListView,
	getHasAutoActiveDescriptor, getInspectorSettings,
	getSelectedDescriptors, getReplayEnabled, getRanameEnabled, getAllDescriptors,
	getCopyToClipboardEnabled,
	getActiveRef,
} from "../selectors/inspectorSelectors";
import {Dispatch} from "redux";
import {ActionDescriptor} from "photoshop/dom/CoreModules";
import {filterNonExistent} from "../classes/filterNonExistent";
import {FiltersContainer} from "./Filters";
import {getGeneratedCode} from "../selectors/inspectorCodeSelectors";

export const LeftColumn: React.FC<TLeftColumn> = (props) => {
	const marketplaceDialogRef = React.useRef<any>(null);
	const clearMenuRef = React.useRef<any>(null);
	const lastDescRef = React.useRef<HTMLDivElement>(null);
	const wrapperDescRef = React.useRef<HTMLDivElement>(null);

	const didMountRef = React.useRef(false);
	React.useEffect(() => {
		if (!didMountRef.current) {
			didMountRef.current = true;
			return;
		}
		const itemElement = lastDescRef.current;
		const wrapperElement = wrapperDescRef.current;
		if (!itemElement || !wrapperElement) {return;}
		if (wrapperElement.scrollHeight - wrapperElement.offsetHeight - wrapperElement.scrollTop <= 20) {
			itemElement.scrollIntoView(true);
		}
	});

	const getDescriptor = async (): Promise<void> => {
		const {activeRef} = props;
		if (!props.addAllowed) {
			return;
		}
		const result = await GetInfo.getAM(activeRef);
		if (result === null) {
			NotificationManager.error("Please make sure that item you want to add exists in Photoshop", "Failed", 3500);
			return;
		}
		props.onAddDescriptor(result);

	};

	const autoInspector = async (event: string, descriptor: any): Promise<void> => {
		if (event !== "select") {return;}
		const startTime = Date.now();
		const calculatedReference: ITargetReferenceAM = {
			_obj: "get",
			_target: descriptor._target,
		};
		const playResult = await photoshop.action.batchPlay([calculatedReference], {});
		const originalReference = guessOriginalReference(descriptor._target);
		if (!originalReference) {
			console.error("Can't identify: ", calculatedReference);
			return;
		}

		const result: IDescriptor = {
			endTime: Date.now(),
			startTime: startTime,
			id: crypto.randomUUID(),
			locked: false,
			crc: crc(JSON.stringify(playResult)),
			recordedData: RawDataConverter.replaceArrayBuffer(playResult),
			originalReference,
			pinned: false,
			renameMode: false,
			selected: false,
			title: GetInfo.generateTitle(originalReference, calculatedReference),
			playAbleData: calculatedReference,
			descriptorSettings: props.settings.initialDescriptorSettings,
		};

		props.onAddDescriptor(result);
	};

	/**
	 * Listener to be attached to all Photoshop notifications.
	 */
	const listener = async (event: string, descriptor: any, spy = false): Promise<void> => {
		if (props.settings.neverRecordActionNames.includes(event)) {
			return;
		}

		const category = descriptor?._isCommand ? "listener" : "notifier";

		// delete because it will be added as a first later
		delete descriptor._obj;

		console.log(event);
		const originalReference: IRefListener | IRefNotifier = {
			type: category,
		};
		const descWithEvent: ITargetReferenceAM = {
			_obj: event,
			...descriptor,
		};

		const descCrc = crc(JSON.stringify(descWithEvent));
		const originalData = RawDataConverter.replaceArrayBuffer(descWithEvent);

		const result: IDescriptor = {
			endTime: 0,
			startTime: 0,
			crc: descCrc,
			id: crypto.randomUUID(),
			locked: false,
			recordedData: originalData,
			originalReference,
			pinned: false,
			selected: false,
			renameMode: false,
			playAbleData: descWithEvent,
			title: (spy ? "[S] " : "") + GetInfo.generateTitle(originalReference, descWithEvent),
			descriptorSettings: props.settings.initialDescriptorSettings,
		};

		props.onAddDescriptor(result);
	};

	/**
	 * Listen to more PS events
	 */
	const spy = async (event: string, descriptor: any): Promise<void> => {
		await listener(event, descriptor, true);
	};

	/**
	 * Attaches the simple listener to the app.
	 */
	const attachListener = async () => {
		const {settings: {dontShowMarketplaceInfo, autoUpdateListener}} = props;
		if (!dontShowMarketplaceInfo && !autoUpdateListener && !Main.devMode && !Main.isFirstParty) {
			const res = await marketplaceDialogRef.current.uxpShowModal({
				title: "Advice",
				size: {
					width: 400,
				},
			});
			console.log(res);
		}

		if (autoUpdateListener) {
			ListenerClass.stopListener();
		} else {
			ListenerClass.startListener(listener);
		}
		props.setListener(!autoUpdateListener);
	};

	const attachSpy = async () => {
		const {settings: {autoUpdateSpy}} = props;
		if (autoUpdateSpy) {
			ListenerClass.stopSpy();
		} else {
			ListenerClass.startSpy(spy);
		}
		props.setSpy(!autoUpdateSpy);
	};

	const attachAutoInspector = async () => {
		const {settings: {autoUpdateInspector}} = props;
		props.setAutoInspector(!autoUpdateInspector);
		if (autoUpdateInspector) {
			ListenerClass.stopInspector();
		} else {
			ListenerClass.startInspector(autoInspector);
		}
		props.setAutoInspector(!autoUpdateInspector);
	};

	const renderDescriptorsList = (): React.ReactNode => {
		const {allInViewDescriptors} = props;
		return (
			allInViewDescriptors.map((d, index) => {
				return (
					<div className={"DescriptorItem"} key={index} ref={index === allInViewDescriptors.length - 1 ? lastDescRef as any : null}>
						<DescriptorItemContainer descriptor={d} key={d.id} />
					</div>
				);
			})
		);
	};

	const onSearch = (e: string) => {
		props.setSearchTerm(e);
	};

	const onPlaySeparated = async () => {
		const toPlay = props.selectedDescriptors;
		for await (const item of toPlay) {
			const startTime = Date.now();
			let descriptors: ActionDescriptor[] | null;
			try {
				descriptors = await replayDescriptor(item.playAbleData as ActionDescriptor);
			} catch (e: any) {
				NotificationManager.error(e.message, "Replay failed", 5000);
				console.error("error");
				return;
			}
			const endTime = Date.now();

			const originalReference: IRefReplies = {
				type: "replies",
			};

			const result: IDescriptor = {
				endTime,
				startTime,
				id: crypto.randomUUID(),
				locked: false,
				crc: crc(JSON.stringify(descriptors)),
				recordedData: descriptors ? RawDataConverter.replaceArrayBuffer(descriptors) : null,
				originalReference,
				pinned: false,
				selected: false,
				renameMode: false,
				playAbleData: descriptors,
				title: GetInfo.generateTitle(originalReference, item.playAbleData as ITargetReferenceAM),
				descriptorSettings: props.settings.initialDescriptorSettings,
			};

			props.onAddDescriptor(result);
		}
	};

	const rename = () => {
		const {setRenameMode, selectedDescriptorsUUIDs} = props;
		if (selectedDescriptorsUUIDs.length) {
			setRenameMode(selectedDescriptorsUUIDs[0], true);
		}
	};

	const renderMarketplaceDialog = () => {
		const {onSetDontShowMarketplaceInfo} = props;

		return (<dialog className="MarketplaceAdvice" ref={marketplaceDialogRef}>
			<form>
				<sp-heading>This is marketplace version of Alchemist</sp-heading>
				<sp-body>
					<p>This version will not listen to all events due to limitation in Photoshop but it will try to listen as much as possible. If you know such a event please post it <a href="https://github.com/jardicc/alchemist/issues/3">here</a>.</p>
					<p>Also Alchemist might be unresponsive for several seconds once you click continue. <a href="https://github.com/jardicc/alchemist">Get development version here</a></p>
				</sp-body>
				<footer>
					<label className="dontShowLabel"><SP.Checkbox onChange={(e: any) => onSetDontShowMarketplaceInfo(e.currentTarget.checked)} />{"Don't show again"}</label>
					{/*<sp-button quiet={true} variant="secondary">Cancel</sp-button>*/}
					<sp-button variant="cta" onClick={() => {marketplaceDialogRef.current.close("true");}}>Continue</sp-button>
				</footer>
			</form>
		</dialog>);
	};

	const copyToClipboard = () => {
		(navigator.clipboard as any).setContent({"text/plain": props.generatedCode});
	};

	const closeClearMenu = () => {
		clearMenuRef.current.removeAttribute("open");
	};

	const {addAllowed, replayEnabled, onLock, onPin, onRemove, selectedDescriptorsUUIDs,
		selectedDescriptors, lockedSelection, pinnedSelection, renameEnabled,
		settings: {autoUpdateListener, autoUpdateInspector, searchTerm, groupDescriptors, autoUpdateSpy},
		onClear, onClearView, onClearNonExistent, allDescriptors, copyToClipboardEnabled,
	} = props;
	return (
		<div className="Filters LeftColumn">
			<div className="oneMore">
				<FiltersContainer />
				<div className="search">
					<SP.Textfield placeholder="Search..." onInput={(e: any) => onSearch(e.currentTarget.value)} value={searchTerm || ""} quiet />
					<SP.Checkbox onChange={props.toggleDescGrouping} checked={groupDescriptors === "strict"}> <span className="groupLabel">Group</span></SP.Checkbox>
				</div>
				<div className="descriptorsWrapper" ref={wrapperDescRef} onClick={() => props.onSelect("none")}>
					{renderDescriptorsList()}
				</div>

				<div className="descriptorButtons">

					<sp-overlay>
						<div slot="trigger" className="button">
							Clear...
						</div>
						<sp-popover
							ref={clearMenuRef}
							placement="auto"
							alignment="auto"
							slot="click"
						>
							<div className="column">
								<div className="button" onClick={() => {closeClearMenu(); onClear();}}>All</div>
								<div className="button" onClick={() => {closeClearMenu(); onClearView(false);}}>In view</div>
								<div className="button" onClick={() => {closeClearMenu(); onClearView(true);}}>Not in view</div>
								<div className="button" onClick={() => {closeClearMenu(); onClearNonExistent(filterNonExistent(allDescriptors));}}>Non-existent</div>
							</div>
						</sp-popover>
					</sp-overlay>

					<div className="spread"></div>

					{/*
						<div className="settings buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconCog/></div>
					*/}
					<div title="Rename" className={"rename buttonIcon " + (renameEnabled ? "allowed" : "disallowed")} onClick={rename}><IconPencil /></div>
					<div title="Copy to clipboard" className={"clipboard buttonIcon " + (copyToClipboardEnabled ? "allowed" : "disallowed")} onClick={copyToClipboard}><IconClipboard /></div>
					<div title="Replay" className={"play buttonIcon " + (replayEnabled ? "" : "disallowed")} onClick={onPlaySeparated}><IconPlayIcon /></div>
					<div title="(Un)lock" className={"lock buttonIcon " + ((selectedDescriptors?.length) ? "" : "disallowed")} onClick={() => {onLock(!lockedSelection, selectedDescriptorsUUIDs);}}>
						{selectedDescriptors.some(desc => desc.locked) ? <IconLockUnlocked /> : <IconLockLocked />}
					</div>
					<div title="(Un)pin" className={"pin buttonIcon " + ((selectedDescriptors?.length) ? "" : "disallowed")} onClick={() => {onPin(!pinnedSelection, selectedDescriptorsUUIDs);}}>
						{selectedDescriptors.some(desc => desc.pinned) ? <IconPinLeft /> : <IconPinDown />}
					</div>
					<div title="Remove" className={"remove buttonIcon " + ((selectedDescriptors?.length) ? "" : "disallowed")} onClick={() => {onRemove(selectedDescriptorsUUIDs);}}><IconTrash /></div>
				</div>
				<div className="filterButtons">
					<div className={"add button" + (addAllowed ? " allowed" : " disallowed")} onClick={getDescriptor}><IconPlus /> Add</div>
					<div className={"listenerSwitch button" + (autoUpdateListener ? " activated" : " deactivated")} onClick={attachListener}>{autoUpdateListener ? <IconMediaStop /> : <IconMediaRecord />}Listener</div>
					{
						// helper tool to listen to more events
						Main.isFirstParty && <div className={"listenerSwitch button" + (autoUpdateSpy ? " activated" : " deactivated")} onClick={attachSpy}>{autoUpdateSpy ? <IconMediaStop /> : <IconMediaRecord />}Spy</div>
					}
					<div className={"autoInspectorSwitch button" + (autoUpdateInspector ? " activated" : " deactivated")} onClick={attachAutoInspector}>{autoUpdateInspector ? <IconMediaStop /> : <IconMediaRecord />}Inspector</div>
				</div>
			</div>
			{renderMarketplaceDialog()}
		</div>
	);
};


type TLeftColumn = ILeftColumnProps & ILeftColumnDispatch

export interface ILeftColumnProps {
	activeRef: TAllTargetReferences;
	addAllowed: boolean
	allDescriptors: IDescriptor[]
	allInViewDescriptors: IDescriptor[]
	autoUpdate: boolean
	hasAutoActiveDescriptor: boolean
	lockedSelection: boolean
	pinnedSelection: boolean
	removableSelection: boolean
	renameEnabled: boolean
	replayEnabled: boolean
	generatedCode: string
	copyToClipboardEnabled: boolean
	selectedDescriptors: IDescriptor[]
	selectedDescriptorsUUIDs: string[]
	settings: ISettings
}

const mapStateToProps = (state: IRootState): ILeftColumnProps => ({
	activeRef: getActiveRef(state),
	copyToClipboardEnabled: getCopyToClipboardEnabled(state),
	addAllowed: getAddAllowed(state),
	allDescriptors: getAllDescriptors(state),
	allInViewDescriptors: getDescriptorsListView(state),
	autoUpdate: getAutoUpdate(state),
	hasAutoActiveDescriptor: getHasAutoActiveDescriptor(state),
	lockedSelection: getLockedSelection(state),
	pinnedSelection: getPinnedSelection(state),
	removableSelection: getRemovableSelection(state),
	renameEnabled: getRanameEnabled(state),
	replayEnabled: getReplayEnabled(state),
	generatedCode: getGeneratedCode(state),
	selectedDescriptors: getSelectedDescriptors(state),
	selectedDescriptorsUUIDs: getSelectedDescriptorsUUID(state),
	settings: getInspectorSettings(state),
});

interface ILeftColumnDispatch {
	onAddDescriptor: (descriptor: IDescriptor) => void
	onSelect: (operation: TSelectDescriptorOperation, uuid?: string) => void

	onClear: () => void
	onPin: (pin: boolean, uuids: string[]) => void
	onRemove: (uuids: string[]) => void
	onLock: (lock: boolean, uuids: string[]) => void


	setListener: (enabled: boolean) => void
	setSpy: (enabled: boolean) => void
	setAutoInspector: (enabled: boolean) => void
	setSearchTerm: (str: string) => void
	setRenameMode: (uuid: string, on: boolean) => void

	onSetDontShowMarketplaceInfo: (enabled: boolean) => void
	toggleDescGrouping: () => void

	onClearView: (keep: boolean) => void
	onClearNonExistent: (items: IDescriptor[]) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ILeftColumnDispatch, Record<string, unknown>> = (dispatch: Dispatch): ILeftColumnDispatch => ({
	onAddDescriptor: (desc) => dispatch(addDescriptorAction(desc, false)),

	onClear: () => dispatch(clearAction()),
	onPin: (pin, arg) => dispatch(pinDescAction(pin, arg)),
	onRemove: (arg) => dispatch(removeDescAction(arg)),
	onLock: (lock, arg) => dispatch(lockDescAction(lock, arg)),

	setListener: (enabled) => dispatch(setListenerAction(enabled)),
	setSpy: (enabled) => dispatch(setSpyAction(enabled)),
	setAutoInspector: (enabled) => dispatch(setAutoInspectorAction(enabled)),
	setSearchTerm: (str) => dispatch(setSearchTermAction(str)),
	setRenameMode: (uuid: string, on: boolean) => dispatch(setRenameModeAction(uuid, on)),
	onSelect: (operation: TSelectDescriptorOperation, uuid?: string) => dispatch(selectDescriptorAction(operation, uuid)),

	onSetDontShowMarketplaceInfo: (enabled: boolean) => dispatch(setDontShowMarketplaceInfoAction(enabled)),
	toggleDescGrouping: () => dispatch(toggleDescriptorsGroupingAction()),

	onClearView: (keep) => dispatch(clearViewAction(keep)),
	onClearNonExistent: (items) => dispatch(importItemsAction(items, "replace")),
});

export const LeftColumnContainer = connect<ILeftColumnProps, ILeftColumnDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(LeftColumn);