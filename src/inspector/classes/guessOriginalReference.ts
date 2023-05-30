import { IRefChannel, IRefDocument, IRefHistoryState, IRefLayer, IRefPath, IRefSnapshotClass, TAllTargetReferences, TChannelReferenceValid } from "../model/types";
import { Reference, TReference } from "./Reference";
import { getInitialState } from "../inspInitialState";

// used for auto inspector
export const guessOriginalReference = (refAM: TReference[]): TAllTargetReferences|null => {
	const r = new Reference(refAM);
	const init = getInitialState().targetReference;

	// TODO - fix this. Add mechanism to convert any reference to ID reference


	if (!r.targetClass) {
		return null;
	}

	switch (r.targetClass) {
		case "layer": {
			const res: IRefLayer = {
				...init.layer,
				documentID: r.document?._id ?? init.layer.documentID,
				layerID: r.layer?._id ?? init.layer.layerID,
			};
			return res;
		}
		case "document": {
			const res: IRefDocument = {
				...init.document,
				documentID: r.document?._id ?? init.document.documentID,
			};
			return res;
		}
		case "path": {
			const res: IRefPath = {
				...init.path,
				documentID: r.document?._id ?? init.path.documentID,
				layerID: r.layer?._id ?? init.path.layerID,
				pathID: r.path?._id ?? init.path.pathID,
			};
			return res;
		}
		case "historyState": {
			const res: IRefHistoryState = {
				...init.historyState,
				historyID: r.historyState?._id ?? init.historyState.historyID,
			};
			return res;
		}
		case "snapshotClass": {
			const res: IRefSnapshotClass = {
				...init.snapshotClass,
				snapshotID: r.snapshotClass?._id ?? init.snapshotClass.snapshotID,
			};
			return res;
		}
		case "channel": {
			const channel = r.channel;
			const res: IRefChannel = {
				...init.channel,
				documentID: r.document?._id ?? init.channel.documentID,
				layerID: r.layer?._id ?? init.channel.layerID,
				channelID: (channel && "_enum" in channel) ? channel._value as TChannelReferenceValid: channel?._id ?? init.channel.layerID as TChannelReferenceValid,
			};
			return res;
		}
		default: {
			return null;
		}
	}
};