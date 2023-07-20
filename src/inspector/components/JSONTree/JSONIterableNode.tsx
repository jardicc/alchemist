/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { JSONNestedNode } from "./JSONNestedNode";
import { INestedNodeProps } from "./types";

// Returns the "n Items" string for this node,
// generating and caching it if it hasn't been created yet.
const createItemString = (data: any, limit: number) => {
  let count = 0;
  let hasMore = false;
  if (Number.isSafeInteger(data.size)) {
    count = data.size;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const entry of data) {
      if (limit && count + 1 > limit) {
        hasMore = true;
        break;
      }
      count += 1;
    }
  }
  return `${hasMore ? ">" : ""}${count} ${count !== 1 ? "entries" : "entry"}`;
};

// Configures <JSONNestedNode> to render an iterable
export function JSONIterableNode({ ...props }: INestedNodeProps): JSX.Element {
  return (
    <JSONNestedNode
      {...props}
      nodeType="Iterable"
      nodeTypeIndicator="()"
      createItemString={createItemString}
    />
  );
}
