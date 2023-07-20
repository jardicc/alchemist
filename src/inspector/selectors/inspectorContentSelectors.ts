import _, { cloneDeep } from "lodash";
import { createSelector } from "reselect";
import {
  getSelectedDescriptors,
  getAutoActiveDescriptor,
  getActiveDescriptors,
  all,
} from "./inspectorSelectors";

export const getInspectorContentTab = createSelector([all], (t) => {
  return t.inspector.content;
});

export const getContentPath = createSelector([getInspectorContentTab], (t) => {
  return t.treePath;
});

export const getContentActiveView = createSelector(
  [getInspectorContentTab],
  (t) => {
    return t.viewType;
  },
);

export const getSearchContentKeyword = createSelector(
  [getInspectorContentTab],
  (t) => {
    return t.search;
  },
);

export const getTreeContentUnfiltered = createSelector(
  [getSelectedDescriptors, getContentPath, getAutoActiveDescriptor],
  (t, d, autoActive) => {
    const path = cloneDeep(d);
    // selected or auto-selected
    let data: any = cloneDeep(t?.[0]?.recordedData ?? autoActive?.recordedData);

    for (const part of path) {
      data = data?.[part];
    }

    // make primitive types pin-able
    if (typeof data !== "object" && data !== undefined && data !== null) {
      const lastPart = path[path.length - 1];
      data = { ["$$$noPin_" + lastPart]: data };
    }
    return data;
  },
);

export const getActiveDescriptorContent = createSelector(
  [getActiveDescriptors, getAutoActiveDescriptor, getSearchContentKeyword],
  (selected, autoActive, keyword) => {
    if (selected.length >= 1) {
      const toSend = selected.map((item) => filter(item.recordedData, keyword));
      return JSON.stringify(toSend.length === 1 ? toSend[0] : toSend, null, 3);
    } else if (autoActive) {
      return JSON.stringify(autoActive.recordedData, null, 3);
    } else {
      return "Add some descriptor";
    }
  },
);

export const getContentExpandedNodes = createSelector(
  [getInspectorContentTab],
  (t) => {
    return t.expandedTree;
  },
);

export const getContentExpandLevel = createSelector(
  [getInspectorContentTab],
  (t) => {
    return t?.autoExpandLevels ?? 0;
  },
);

// TODO do not add array item by property name e.g. do not search by index ["4"]
export const getTreeContent = createSelector(
  [getTreeContentUnfiltered, getSearchContentKeyword],
  (tree, keyword) => {
    return filter(tree, keyword);
  },
);

function filter(tree: any, keyword: string) {
  const foundPaths: string[][] = [];
  const currentPath: string[] = [];
  keyword = keyword.toLowerCase();

  if (!keyword) {
    return tree;
  }

  if (typeof tree !== "object") {
    // TODO
    return tree;
  }
  recursion(tree);
  function recursion(obj: any) {
    const entries = Object.entries(obj);
    entries.forEach((entry) => {
      let added = false;
      if (entry[0].toLowerCase().includes(keyword)) {
        foundPaths.push([...currentPath, entry[0]]);
        added = true;
      }

      switch (typeof entry[1]) {
        case "bigint":
        case "boolean":
        case "number":
        case "string": {
          if (entry[1].toString().toLowerCase().includes(keyword) && !added) {
            foundPaths.push([...currentPath, entry[0]]);
          }
          break;
        }
        case "undefined": {
          if ("undefined".includes(keyword) && !added) {
            foundPaths.push([...currentPath, entry[0]]);
          }
          break;
        }
        case "object": {
          if (entry[1] === null) {
            if ("null".includes(keyword) && !added) {
              foundPaths.push([...currentPath, entry[0]]);
            }
          } else {
            currentPath.push(entry[0]);
            recursion(entry[1]);
            currentPath.pop();
          }
          break;
        }
        case "function":
        case "symbol": {
          throw new Error(`Not implemented type: ${typeof entry[1]}`);
        }
        default: {
          throw new Error(`Unknown type: ${typeof entry[1]}`);
        }
      }
    });
  }

  const individualObjects = foundPaths.map((path) => {
    const item: any = {};
    let lastItem = item;
    let lastValue = tree;
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      if (i === path.length - 1) {
        lastItem[segment] = lastValue[segment];
      } else {
        lastItem[segment] = {};
        lastValue = lastValue[segment];
        lastItem = lastItem[segment];
      }
    }
    return item;
  });
  const result = _.merge({}, ...individualObjects);

  //console.log(foundPaths);
  return result;
}
