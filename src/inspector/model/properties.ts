
import {
	TTargetReference, TBaseProperty, TDocumentReference, TLayerReference, TPathReference, TChannelReference,
	TGuideReference, TActionSet, TActionItem, TActionCommand, IFilterProperty,
} from "./types";

export type TBaseItems = (
	IFilterProperty<TTargetReference> |
	IFilterProperty<TBaseProperty>|
	IFilterProperty<TDocumentReference>|
	IFilterProperty<TLayerReference>|
	IFilterProperty<TPathReference>|
	IFilterProperty<TChannelReference> |
	IFilterProperty<TGuideReference> |
	IFilterProperty<TActionSet> |
	IFilterProperty<TActionItem> |
	IFilterProperty<TActionCommand>
)[]
	

export const mainClasses: IFilterProperty<TTargetReference>[] = [
	{ label: "Listener - Playable", value: "listener" },
	{ label: "Listener - Events", value: "notifier" },
	{ label: "Dispatcher", value: "dispatcher" },
	{label: "Replies", value: "replies"},
	
	{ label: "Application", value: "application" },
	{ label: "Document", value: "document" },
	{ label: "Layer", value: "layer" },
	{ label: "Channel", value: "channel" },
	{ label: "Path", value: "path" },
	{ label: "Action", value: "action" },
	{ label: "Guide", value: "guide" },
	{ label: "History", value: "history" },
	{ label: "Snapshot", value: "snapshot" },
	{ label: "Animation", value: "animation" },
	{ label: "Animation Frame", value: "animationFrame" },
	{ label: "Timeline", value: "timeline" },
	{ label: "Generator", value: "generator" },
	// { label: "Overkill", value: "overkill" },
	//{ label: "Custom descriptor", value: "customDescriptor" },
	//{ label: "Features", value: "featureData" },
];
export const baseItemsProperty:IFilterProperty<TBaseProperty>[] = [
	{ label: "(not specified)", value: "notSpecified" },
];
/*
export const baseItemsCustomDescriptor:IFilterProperty<string>[] = [
	{ label: "(undefined)", value: "undefined" },
];*/
export const baseItemsDocument:IFilterProperty<TDocumentReference>[] = [
	{ label: "(active)", value: "active" },
];
export const baseItemsLayer:IFilterProperty<TLayerReference>[] = [
	{ label: "(active)", value: "active" },
];
export const baseItemsPath :IFilterProperty<TPathReference>[]= [
	{ label: "(active)", value: "active" },
	{ label: "(vector mask)", value: "vectorMask" },
	{ label: "(work path)", value: "workPathIndex" },
];
export const baseItemsChannel:IFilterProperty<TChannelReference>[] = [
	{ label: "(active)", value: "active" },
	{ label: "(composite)",value: "composite"},
	{ label: "(Mask)",value: "mask"},
	{ label: "(Filter mask)",value: "filterMask"},
	{ label: "(Transparency)",value: "transparencyEnum"},
	{ label: "(RGB)",value: "RGB"},
	{ label: "(Red - RGB)",value: "red"},
	{ label: "(Green - RGB)",value: "green"},
	{ label: "(Blue - RGB)",value: "blue"},
	{ label: "(CMYK)",value: "CMYK"},
	{ label: "(Black - CMYK)",value: "black"},
	{ label: "(Cyan - CMYK)",value: "cyan"},
	{ label: "(Magenta - CMYK)",value: "magenta"},
	{ label: "(Yellow - CMYK)",value: "yellow"},
	{ label: "(Lab)",value: "lab"},
	{ label: "(Lightness - Lab)",value: "lightness"},
	{ label: "(a - Lab)",value: "a"},
	{ label: "(b - Lab)",value: "b"},
	{ label: "(Gray)",value: "gray"},
	{ label: "(Monotone)",value: "monotone"},
	{ label: "(Duotone)",value: "duotone"},
	{ label: "(Tritone)",value: "tritone"},
	{ label: "(Quadtone)",value: "quadtone"},

];
export const baseItemsGuide:IFilterProperty<TGuideReference>[] = [
	{ label: "(undefined)", value: "" },
];	
export const baseItemsActionCommon:(IFilterProperty<TActionSet>|IFilterProperty<TActionItem>|IFilterProperty<TActionCommand>)[] = [
	{ label: "(undefined)", value: "" },
];	

