import React from "react";
import "./LeftColumn.less";
import { GetInfo, ITargetReferenceAM } from "../../classes/GetInfo";
import { DescriptorItemContainer } from "../DescriptorItem/DescriptorItemContainer";
import { IDescriptor, ITargetReference, ISettings, TSelectDescriptorOperation } from "../../model/types";
import { IconLockLocked, IconPinDown, IconTrash, IconPencil, IconPlayIcon, IconLockUnlocked, IconPinLeft, IconPlus, IconMediaRecord, IconMediaStop, IconClipboard } from "../../../shared/components/icons";
import { ListenerClass } from "../../classes/Listener";
import photoshop from "photoshop";
import { Helpers, replayDescriptor } from "../../classes/Helpers";
import { guessOrinalReference } from "../../classes/guessOriginalReference";
import { RawDataConverter } from "../../classes/RawDataConverter";
import {NotificationManager} from "react-notifications";
import { str as crc } from "crc-32";
import SP from "react-uxp-spectrum";

import { Main } from "../../../shared/classes/Main";
import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { addDescriptorAction, clearAction, pinDescAction, removeDescAction, lockDescAction, setListenerAction, setAutoInspectorAction, setSearchTermAction, setRenameModeAction, selectDescriptorAction, setDontShowMarketplaceInfoAction, toggleDescriptorsGroupingAction, clearViewAction, importItemsAction, setSpyAction } from "../../actions/inspectorActions";
import { getTargetReference, getAutoUpdate, getAddAllowed, getSelectedDescriptorsUUID, getLockedSelection, getPinnedSelection, getRemovableSelection, getDescriptorsListView, getHasAutoActiveDescriptor, getActiveTargetReferenceForAM, getInspectorSettings, getSelectedDescriptors, getReplayEnabled, getRanameEnabled, getAllDescriptors, getCopyToClipboardEnabled } from "../../selectors/inspectorSelectors";
import { Dispatch } from "redux";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
import { ButtonMenu } from "../ButtonMenu/ButtonMenu";
import { filterNonExistent } from "../../classes/filterNonExistent";
import {FiltersContainer} from "../Filters/Filters";
import {getGeneratedCode} from "../../selectors/inspectorCodeSelectors";

export class LeftColumn extends React.Component<TLeftColumn, IState> {
	constructor(props: TLeftColumn) {
		super(props);
		this.marketplaceDialogRef = React.createRef();
	}

	private marketplaceDialogRef: React.RefObject<any>;
	private lastDescRef:React.RefObject<HTMLDivElement> = React.createRef();
	private wrapperDescRef:React.RefObject<HTMLDivElement> = React.createRef();

	public componentDidUpdate = (): void => {
		const itemElement = this.lastDescRef?.current;
		const wrapperElement = this.wrapperDescRef?.current;
		if (!itemElement || !wrapperElement) {return;}
		if (wrapperElement.scrollHeight - wrapperElement.offsetHeight - wrapperElement.scrollTop <= 20) {
			itemElement.scrollIntoView();			
		}
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

		const category = descriptor?._isCommand ? "listener" : "notifier";

		// if (category === "notifier") {debugger;}

		// delete because it will be added as a first later
		delete descriptor._obj;

		console.log(event);
		const originalReference:ITargetReference = {
			type: category,
			data: [],
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
		if (!dontShowMarketplaceInfo && !autoUpdateListener && !Main.devMode && !Main.isFirstParty) {
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

	private attachSpy = async () => {
		const { settings:{autoUpdateSpy}} = this.props;
		if (autoUpdateSpy) {
			ListenerClass.stopSpy();
		} else {
			ListenerClass.startSpy(this.props.settings.neverRecordActionNames, this.props.settings.initialDescriptorSettings, this.props.onAddDescriptor);
		}
		this.props.setSpy(!autoUpdateSpy);
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

	private renderDescriptorsList = (): React.ReactNode => {
		const { allInViewDescriptors } = this.props;
		return (
			allInViewDescriptors.map((d, index) => {
				return (
					<div className={"DescriptorItem"}  key={index} ref={index === allInViewDescriptors.length - 1 ? this.lastDescRef as any : null}>
						<DescriptorItemContainer descriptor={d} key={d.id} />
					</div>
				);
			})
		);
	}

	private onSearch = (e: string) => {
		this.props.setSearchTerm(e);
	}

	private onPlaySeparated = async () => {
		const toPlay = this.props.selectedDescriptors;
		for await (const item of toPlay) {
			const startTime = Date.now();
			let descriptors:ActionDescriptor[]|null;
			try {
				descriptors = await replayDescriptor(item.calculatedReference as ActionDescriptor);				
			} catch (e:any) {
				NotificationManager.error(e.message,"Replay failed", 5000);
				console.error("error");
				return;
			}
			const endTime = Date.now();

			const originalReference: ITargetReference = {
				type: "replies",
				data: [],
			};

			const result: IDescriptor = {
				endTime,
				startTime,
				id: Helpers.uuidv4(),
				locked: false,
				crc: crc(JSON.stringify(descriptors)),
				originalData: descriptors ? RawDataConverter.replaceArrayBuffer(descriptors) : null,
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
					<label className="dontShowLabel"><SP.Checkbox onChange={(e: any) => onSetDontShowMarketplaceInfo(e.currentTarget.checked)} />{"Don't show again"}</label>
					{/*<sp-button quiet={true} variant="secondary">Cancel</sp-button>*/}
					<sp-button variant="cta" onClick={() => { this.marketplaceDialogRef.current.close("true"); }}>Continue</sp-button>
				</footer>
			</form>
		</dialog>);
	}

	private copyToClipboard = () => {
		(navigator.clipboard as any).setContent({"text/plain": this.props.generatedCode});
	}

	public render(): JSX.Element {
		const { addAllowed, replayEnabled, onLock, onPin, onRemove, selectedDescriptorsUUIDs,
			selectedDescriptors, lockedSelection, pinnedSelection, renameEnabled,
			settings: { autoUpdateListener, autoUpdateInspector, searchTerm, groupDescriptors,autoUpdateSpy, isSpyInstalled },
			onClear, onClearView, onClearNonExistent, allDescriptors,copyToClipboardEnabled,
		} = this.props;
		return (
			<div className="Filters LeftColumn">
				<div className="oneMore">
					<FiltersContainer />
					<div className="search">
						<SP.Textfield placeholder="Search..." onInput={(e: any) => this.onSearch(e.currentTarget.value)} value={searchTerm || ""} quiet />
						<SP.Checkbox onChange={this.props.toggleDescGrouping} checked={groupDescriptors === "strict"}> <span className="groupLabel">Group</span></SP.Checkbox>
					</div>
					<div className="descriptorsWrapper" ref={this.wrapperDescRef} onClick={() => this.props.onSelect("none")}>
						{this.renderDescriptorsList()}
					</div>

					<div className="descriptorButtons">
						<ButtonMenu
							key="clear"
							className="abc"
							placementVertical="top"
							placementHorizontal="right"
							items={
								<div className="column">
									<div className="button" onMouseDown={() => { onClear(); }}>All</div>
									<div className="button" onMouseDown={() => { onClearView(false); }}>In view</div>
									<div className="button" onMouseDown={() => { onClearView(true); }}>Not in view</div>
									<div className="button" onMouseDown={() => { onClearNonExistent(filterNonExistent(allDescriptors)); }}>Non-existent</div>
								</div>
							}>
							<div className="button">Clear...</div>
						</ButtonMenu>
						<div className="spread"></div>

						{/*
							<div className="settings buttonIcon" onClick={() => { onLock(!lockedSelection, selectedDescriptors); }}><IconCog/></div>
						*/}
						<div title="Rename" className={"rename buttonIcon " + (renameEnabled ? "allowed" : "disallowed")} onClick={this.rename}><IconPencil /></div>
						<div title="Copy to clipboard"  className={"clipboard buttonIcon " + (copyToClipboardEnabled ? "allowed" : "disallowed")} onClick={this.copyToClipboard}><IconClipboard/></div>
						<div title="Replay" className={"play buttonIcon " + (replayEnabled ? "" : "disallowed")} onClick={this.onPlaySeparated}><IconPlayIcon /></div>
						<div title="(Un)lock" className={"lock buttonIcon " + ((selectedDescriptors?.length) ? "" : "disallowed")} onClick={() => { onLock(!lockedSelection, selectedDescriptorsUUIDs); }}>
							{selectedDescriptors.some(desc => desc.locked) ? <IconLockUnlocked /> : <IconLockLocked />}
						</div>
						<div title="(Un)pin" className={"pin buttonIcon " + ((selectedDescriptors?.length) ? "" : "disallowed")} onClick={() => { onPin(!pinnedSelection, selectedDescriptorsUUIDs); }}>
							{selectedDescriptors.some(desc => desc.pinned) ? <IconPinLeft /> : <IconPinDown />}
						</div>
						<div title="Remove" className={"remove buttonIcon " + ((selectedDescriptors?.length) ? "" : "disallowed")} onClick={() => { onRemove(selectedDescriptorsUUIDs); }}><IconTrash /></div>
					</div>
					<div className="filterButtons">
						<div className={"add button" + (addAllowed ? " allowed" : " disallowed")} onClick={this.getDescriptor}><IconPlus /> Add</div>
						<div className={"listenerSwitch button" + (autoUpdateListener ? " activated" : " deactivated")} onClick={this.attachListener}>{autoUpdateListener ? <IconMediaStop /> : <IconMediaRecord />}Listener</div>						
						{
							// helper tool to listen to more events
							isSpyInstalled && <div className={"listenerSwitch button" + (autoUpdateSpy ? " activated" : " deactivated")} onClick={this.attachSpy}>{autoUpdateSpy ? <IconMediaStop /> : <IconMediaRecord />}Spy</div>
						}
						<div className={"autoInspectorSwitch button" + (autoUpdateInspector ? " activated" : " deactivated")} onClick={this.attachAutoInspector}>{autoUpdateInspector ? <IconMediaStop /> : <IconMediaRecord />}Inspector</div>
					</div>
				</div>
				{this.renderMarketplaceDialog()}
			</div>
		);
	}
}


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState{
	//
}

type TLeftColumn = ILeftColumnProps & ILeftColumnDispatch

export interface ILeftColumnProps{
	activeTargetReferenceForAM: ITargetReference | null;
	addAllowed:boolean
	allDescriptors:IDescriptor[]
	allInViewDescriptors: IDescriptor[]
	autoUpdate: boolean
	hasAutoActiveDescriptor:boolean
	lockedSelection: boolean
	pinnedSelection: boolean
	removableSelection: boolean
	renameEnabled: boolean
	replayEnabled: boolean
	generatedCode: string
	copyToClipboardEnabled: boolean
	selectedDescriptors: IDescriptor[]
	selectedDescriptorsUUIDs: string[]
	settings:ISettings	
	targetReference: ITargetReference[]
}

const mapStateToProps = (state: IRootState): ILeftColumnProps => ({
	activeTargetReferenceForAM: getActiveTargetReferenceForAM(state),
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
	targetReference: getTargetReference(state),
});

interface ILeftColumnDispatch {
	onAddDescriptor: (descriptor: IDescriptor) => void
	onSelect: (operation: TSelectDescriptorOperation,uuid?: string) => void
	
	onClear: () => void
	onPin: (pin: boolean, uuids: string[]) => void
	onRemove: (uuids: string[]) => void
	onLock: (lock: boolean, uuids: string[]) => void

	
	setListener:(enabled:boolean)=>void
	setSpy:(enabled:boolean)=>void
	setAutoInspector: (enabled: boolean) => void
	setSearchTerm:(str: string)=> void
	setRenameMode: (uuid: string, on: boolean) => void
	
	onSetDontShowMarketplaceInfo: (enabled: boolean) => void
	toggleDescGrouping: () => void
	
	onClearView: (keep: boolean) => void
	onClearNonExistent:(items: IDescriptor[])=>void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ILeftColumnDispatch, Record<string, unknown>> = (dispatch: Dispatch): ILeftColumnDispatch => ({
	onAddDescriptor: (desc) => dispatch(addDescriptorAction(desc,false)),
	
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
	toggleDescGrouping:()=>dispatch(toggleDescriptorsGroupingAction()),

	onClearView: (keep) => dispatch(clearViewAction(keep)),
	onClearNonExistent:(items)=>dispatch(importItemsAction(items,"replace")),
});

export const LeftColumnContainer = connect<ILeftColumnProps, ILeftColumnDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(LeftColumn);