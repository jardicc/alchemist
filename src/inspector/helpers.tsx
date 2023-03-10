import "react";
import React from "react";
import {
	IconBan,
	IconBrowser, IconChat, IconDocument, IconFork, IconGuides, IconImage, IconInfo, IconLayers,
	IconPlayCircle, IconProject, IconScript, IconStar, IconTimer, IconVideo,
} from "../shared/components/icons";
import {TTargetReference} from "./model/types";

export function getIcon(type: TTargetReference | "error") {
	if (type === "error") {
		return <IconBan />;
	}
	let  icon: JSX.Element = <IconDocument />;
	switch (type) {
		case "listener": {
			icon = <IconStar />;
			break;
		}
		case "notifier": {
			icon = <IconInfo />;
			break;
		}
		case "dispatcher": {
			icon = <IconScript />;
			break;
		}
		case "replies": {
			icon = <IconChat />;
			break;
		}
		case "application": {
			icon = <IconBrowser />;
			break;
		}
		case "document": {
			icon = <IconImage />;
			break;
		}
		case "layer": {
			icon = <IconLayers />;
			break;
		}
		case "channel": {
			break;
		}
		case "path": {
			icon = <IconFork />;
			break;
		}
		case "action": {
			icon = <IconPlayCircle />;
			break;
		}
		case "guide": {
			icon = <IconGuides />;
			break;
		}
		case "history":
		case "snapshot": {
			icon = <IconTimer />;
			break;
		}
		case "animation":
		case "animationFrame": {
			icon = <IconVideo />;
			break;
		}
		case "timeline": {
			icon = <IconProject />;
			break;
		}
	}
	return icon;
}