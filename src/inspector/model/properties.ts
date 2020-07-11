import { IProperty } from "../components/LeftColumn/LeftColumn";
import { TTargetReference, TBaseProperty, TDocumentReference, TLayerReference, TPathReference, TChannelReference, TGuideReference, TActionSet, TActionItem, TActionCommand } from "./types";

export type TBaseItems = (
	IProperty<TTargetReference> |
	IProperty<TBaseProperty>|
	IProperty<TDocumentReference>|
	IProperty<TLayerReference>|
	IProperty<TPathReference>|
	IProperty<TChannelReference> |
	IProperty<TGuideReference> |
	IProperty<TActionSet> |
	IProperty<TActionItem> |
	IProperty<TActionCommand>
)[]
	

export const mainClasses: IProperty<TTargetReference>[] = [
	{ label: "Application", value: "application" },
	{ label: "Document", value: "document" },
	{ label: "Layer", value: "layer" },
	{ label: "Channel", value: "channel" },
	{ label: "Path", value: "path" },
	{ label: "Action", value: "action" },
	{ label: "Guide", value: "guide" },
	{ label: "History", value: "history" },
	{ label: "Snapshot", value: "snapshot" },
	{ label: "Custom descriptor", value: "customDescriptor" },
	{ label: "Generator", value: "generator" },
	{ label: "Features", value: "featureData" },
];
export const baseItemsProperty:IProperty<TBaseProperty>[] = [
	{ label: "(not specified)", value: "notSpecified" },
];
export const baseItemsCustomDescriptor:IProperty<string>[] = [
	{ label: "(undefined)", value: "undefined" },
];
export const baseItemsDocument:IProperty<TDocumentReference>[] = [
	{ label: "(active)", value: "active" },
];
export const baseItemsLayer:IProperty<TLayerReference>[] = [
	{ label: "(active)", value: "active" },
];
export const baseItemsPath :IProperty<TPathReference>[]= [
	{ label: "(active)", value: "active" },
	{ label: "(vector mask)", value: "vectorMask" },
	{ label: "(work path)", value: "workPathIndex" },
];
export const baseItemsChannel:IProperty<TChannelReference>[] = [
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
export const baseItemsGuide:IProperty<TGuideReference>[] = [
	{ label: "(undefined)", value: "undefined" },
];	
export const baseItemsActionCommon:(IProperty<TActionSet>|IProperty<TActionItem>|IProperty<TActionCommand>)[] = [
	{ label: "(undefined)", value: "undefined" },
	{ label: "fake", value: "fake" },
];	

