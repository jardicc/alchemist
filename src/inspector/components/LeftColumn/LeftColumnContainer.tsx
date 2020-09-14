import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ILeftColumnDispatch, ILeftColumnProps, LeftColumn } from "./LeftColumn";
import { IRootState } from "../../../shared/store";
import { getTargetReference, getAutoUpdate, getAddAllowed, getPropertySettings, getLockedSelection, getPinnedSelection, getRemovableSelection, getSelectedDescriptorsUUID, getActiveTargetReference, getActiveTargetDocument, getActiveTargetLayer, getActiveReferenceChannel, getActiveReferenceGuide, getActiveReferencePath, getActiveReferenceActionSet, getActiveReferenceActionItem, getActiveReferenceCommand, getActiveReferenceProperty, getSelectedTargetReference, getDescriptorsListView, getHasAutoActiveDescriptor, getFilterBySelectedReferenceType, getActiveTargetReferenceForAM, getActiveReferenceHistory, getActiveReferenceSnapshot, getInspectorSettings, getActiveTargetReferenceListenerCategory, getSelectedDescriptors } from "../../selectors/inspectorSelectors";
import { setTargetReferenceAction, addDescriptorAction, setSelectedReferenceTypeAction, clearAction, pinDescAction, removeDescAction, lockDescAction, setFilterStateAction, setListenerAction, setAutoInspectorAction, setSearchTermAction } from "../../actions/inspectorActions";
import { TDocumentReference, TLayerReference, TChannelReference, TGuideReference, TPathReference, TActionSet, TActionItem, TActionCommand, IContentWrapper, TBaseProperty, IHistory, THistoryReference, TSnapshotReference, TListenerCategoryReference } from "../../model/types";


const mapStateToProps = (state: IRootState): ILeftColumnProps => {
	return {
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
		
		filterBySelectedReferenceType:getFilterBySelectedReferenceType(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ILeftColumnDispatch, Record<string, unknown>> = (dispatch):ILeftColumnDispatch => {
	return {
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
	};
};

export const LeftColumnContainer = connect<ILeftColumnProps, ILeftColumnDispatch>(mapStateToProps, mapDispatchToProps)(LeftColumn);