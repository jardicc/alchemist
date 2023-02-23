import { TReference, GetInfo } from "./GetInfo";
import { cloneDeep } from "lodash";
import photoshop from "photoshop";
import { IGetNameOutput } from "../model/types";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
import { batchPlaySync } from "../../shared/helpers";

export function getName(refs: TReference[]): IGetNameOutput[] {
	const copyRef = cloneDeep(refs);
	const nameParts:IGetNameOutput[] = [];

	while (copyRef.length) {
		if ("_property" in copyRef[0]) {
			nameParts.push({ typeRef: "property", value: copyRef[0]._property, typeTitle: "PR" });
		} else if ("_ref" in copyRef[0]) {
			nameParts.push({
				typeRef: copyRef[0]._ref,
				typeTitle:getTypeTitle(copyRef[0]._ref),
				value: getNameProp(copyRef),
			});
		}
		
		copyRef.shift();
	}
	
	return nameParts.reverse();
}

function getTypeTitle(str: string): string{
	switch (str) {
		case "actionSet": return "AS";
		case "action": return "AC";
		case "command": return "CM";
		case "layer": return "L";
		case "historyState": return "H";
		case "snapshotClass":return "S";
		case "path": return "PH";
		case "channel": return "CH";
		case "document": return "D";
		case "guide":
		case "timeline":
		case "animationFrame":
		case "animation":
		case "application": return str;
		default: return str;		
	}
}

function getNameProp(refs: TReference[]):string|null {
	let propName: string | null;
	if ("_property" in refs[0]) { return null;}

	switch (refs[0]._ref) {
		case "actionSet":
		case "action":
		case "command":
		case "layer":
		case "historyState":
		case "snapshotClass":
			propName = "name";
			break;
		case "path":
			propName = "pathName";
			break;
		case "channel":
			propName = "channelName";
			break;
		case "document":
			propName = "title";
			break;
		case "guide":
		case "timeline":
		case "animationFrameClass":
		case "animationClass":
		case "application":
			propName = null;
			break;
		default:
			propName = "n/a";
	}

	if (!propName) {
		return null;
	}

	const desc:ActionDescriptor = {
		_obj: "get",
		_target: [
			{
				"_property": propName,
			},
			...refs,
		],
	};
	const result = batchPlaySync([desc]);
	let name = result[0][propName];
	if (name === undefined || name === null) {
		name = "N/A";
	}
	return name;
}


/*
pathName
channelName
title - document,
name - action, layer, snapshot, history, actionset, command
n/a - guide, app




*/