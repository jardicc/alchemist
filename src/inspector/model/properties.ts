import {
	TTargetReference, TBaseProperty, TDocumentReference, TLayerReference, TPathReference, TChannelReference,
	TGuideReference, TActionSet, TActionItem, TActionCommand, IFilterProperty,
} from "./types";

export const mainClasses: IFilterProperty<TTargetReference>[] = [
	{label: "Listener - Playable", value: "listener"},
	{label: "Listener - Events", value: "notifier"},
	{label: "Dispatcher", value: "dispatcher"},
	{label: "Replies", value: "replies"},

	{label: "Application", value: "application"},
	{label: "Document", value: "document"},
	{label: "Layer", value: "layer"},
	{label: "Channel", value: "channel"},
	{label: "Path", value: "path"},
	{label: "Action", value: "actions"},
	{label: "Guide", value: "guide"},
	{label: "History", value: "historyState"},
	{label: "Snapshot", value: "snapshotClass"},
	{label: "Animation", value: "animationClass"},
	{label: "Animation Frame", value: "animationFrameClass"},
	{label: "Timeline", value: "timeline"},
	{label: "Generator", value: "generator"},
	// { label: "Overkill", value: "overkill" },
];
export const baseItemsProperty: IFilterProperty<TBaseProperty>[] = [
	{label: "(not specified)", value: "notSpecified"},
];
export const baseItemsDocument: IFilterProperty<TDocumentReference>[] = [
	{label: "(all)", value: "all"},
	{label: "(active)", value: "selected"},
];
export const baseItemsLayer: IFilterProperty<TLayerReference>[] = [
	{label: "(all)", value: "all"},
	{label: "(active)", value: "selected"},
];
export const baseItemsPath: IFilterProperty<TPathReference>[] = [
	// {label: "(all)", value: "all"}, // -1 index is broken... user has to provide correct count
	{label: "(active)", value: "selected"},
	{label: "(vector mask)", value: "vectorMask"},
	{label: "(work path)", value: "workPathIndex"},
];
export const baseItemsChannel: IFilterProperty<TChannelReference>[] = [
	{label: "(all)", value: "all"},
	{label: "(active)", value: "selected"},
	{label: "(composite)", value: "composite"},
	{label: "(Mask)", value: "mask"},
	{label: "(Filter mask)", value: "filterMask"},
	{label: "(Transparency)", value: "transparencyEnum"},
	{label: "(RGB)", value: "RGB"},
	{label: "(Red - RGB)", value: "red"},
	{label: "(Green - RGB)", value: "green"},
	{label: "(Blue - RGB)", value: "blue"},
	{label: "(CMYK)", value: "CMYK"},
	{label: "(Black - CMYK)", value: "black"},
	{label: "(Cyan - CMYK)", value: "cyan"},
	{label: "(Magenta - CMYK)", value: "magenta"},
	{label: "(Yellow - CMYK)", value: "yellow"},
	{label: "(Lab)", value: "lab"},
	{label: "(Lightness - Lab)", value: "lightness"},
	{label: "(a - Lab)", value: "a"},
	{label: "(b - Lab)", value: "b"},
	{label: "(Gray)", value: "gray"},
	{label: "(Monotone)", value: "monotone"},
	{label: "(Duotone)", value: "duotone"},
	{label: "(Tritone)", value: "tritone"},
	{label: "(Quadtone)", value: "quadtone"},

];
export const baseItemsGuide: IFilterProperty<TGuideReference>[] = [
	{label: "(all)", value: "all"},
	{label: "(undefined)", value: "none"},
];
export const baseItemsActionCommon: (IFilterProperty<TActionSet> | IFilterProperty<TActionItem> | IFilterProperty<TActionCommand>)[] = [
	// {label: "(all)", value: "all"}, // I couldn't find a support
	{label: "(undefined)", value: "none"},
];
