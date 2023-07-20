import { cloneDeep } from "lodash";
import { IGetNameOutput } from "../model/types";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
import { batchPlaySync } from "../../shared/helpers";
import { TReference } from "./Reference";

/** Name to be shown in descriptor list as title */
export function getName(refs: TReference[]): IGetNameOutput[] {
  const copyRef = cloneDeep(refs);
  const nameParts: IGetNameOutput[] = [];

  while (copyRef.length) {
    if ("_property" in copyRef[0]) {
      nameParts.push({
        typeRef: "property",
        value: copyRef[0]._property,
      });
    } else if ("_ref" in copyRef[0]) {
      nameParts.push({
        typeRef: copyRef[0]._ref,
        value: getNameProp(copyRef),
      });
    }

    copyRef.shift();
  }

  return nameParts.reverse();
}

/** We will ask item for its name but different classes are using different property names for name */
function getNameProp(refs: TReference[]): string {
  let propName = "N/A";
  if ("_property" in refs[0]) {
    return propName;
  }

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
    case "animationFrame":
    case "animation":
    case "application":
      // these classes have no property with name so just return class name
      return refs[0]._ref;
  }

  // Ask Photoshop for element name
  const desc: ActionDescriptor = {
    _obj: "get",
    _target: [
      {
        _property: propName,
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
