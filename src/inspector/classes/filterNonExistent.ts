import { IDescriptor } from "../model/types";
import { isValidRef } from "../../shared/helpers";
import { ActionDescriptor } from "photoshop/dom/CoreModules";

export function filterNonExistent(descriptors: IDescriptor[]): IDescriptor[] {
  const result = descriptors.filter((desc) => {
    let res = false;
    switch (desc.originalReference.type) {
      // case "generator":
      case "replies":
      case "dispatcher":
      case "notifier":
      case "listener": {
        return true;
      }
      default: {
        res = isValidRef((desc.playAbleData as ActionDescriptor)._target);
        return res;
      }
    }
  });

  return result;
}
