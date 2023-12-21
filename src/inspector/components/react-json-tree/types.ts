import React from "react";
import {StylingFunction} from "react-base16-styling";

export type Key = string | number;

export type KeyPath = (string | number)[];

export type GetItemString = (
  nodeType: string,
  data: unknown,
  itemType: React.ReactNode,
  itemString: string,
  keyPath: KeyPath,
) => React.ReactNode;

export type ValueRenderer = (
  displayValue: any,
  rawValue?: any,
  nodeType?: TNodeType | undefined,
  ...keyPath: KeyPath
) => React.ReactNode;

export type ShouldExpandNodeInitially = (
  keyPath: KeyPath,
  data: unknown,
  level: number,
) => boolean;

export type PostprocessValue = (value: string | number) => React.ReactNode;

export type IsCustomNode = (value: unknown) => boolean;

export type SortObjectKeys = ((a: unknown, b: unknown) => number) | boolean;

export type Styling = StylingFunction;

export type CircularCache = unknown[];

export interface CommonExternalProps {
  keyPath: KeyPath;
  shouldExpandNode: TShouldExpandNode
  expandClicked: TExpandClicked
  labelRenderer: TLabelRenderer;
  protoMode: TProtoMode;
  valueRenderer: ValueRenderer;
  shouldExpandNodeInitially: ShouldExpandNodeInitially;
  hideRoot: boolean;
  getItemString: GetItemString;
  postprocessValue: PostprocessValue;
  isCustomNode: IsCustomNode;
  collectionLimit: number;
  sortObjectKeys: SortObjectKeys;
}

export interface CommonInternalProps extends CommonExternalProps {
  styling: StylingFunction;
  circularCache?: CircularCache;
  level?: number;
  isCircular?: boolean;
}

export type TNodeType = "Object" | "Error" | "WeakMap" | "WeakSet" | "Array" | "Iterable" | "Map" | "Set" | "String" | "Number" | "Boolean" | "Date" | "Null" | "Undefined" | "Function" | "Symbol" | "Custom" | "Proxy";
export type TShouldExpandNode = (keyPath: KeyPath, data: unknown, level?: number) => boolean;
export type TNonNullish = Record<string, unknown>;
export type TLabelRenderer = (keyPath: KeyPath, nodeType: TNodeType, expanded: boolean, expandable: boolean) => React.ReactNode;
export type TExpandClicked = (keyPath: KeyPath, expanded: boolean, recursive: boolean) => void;
export type TProtoMode = "none" | "uxp" | "advanced" | "all";
export type TStylingArgs = [KeyPath, TNodeType, boolean, boolean]