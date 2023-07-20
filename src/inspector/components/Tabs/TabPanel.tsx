/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";

export interface ITabPanelProps {
  id: string;
  marginRight?: boolean;
  title: string | JSX.Element;
  noPadding?: boolean;
  showScrollbars?: boolean;
  children: JSX.Element | JSX.Element[];
}

export interface ITabPanelDispatch {}

export interface ITabPanelState {}

export type TTabPanel = ITabPanelProps & ITabPanelDispatch;
export type TTabPanelComponent = React.Component<TTabPanel, ITabPanelState>;

export class TabPanel extends React.Component<TTabPanel, ITabPanelState> {
  constructor(props: TTabPanel) {
    super(props);

    this.state = {};
  }

  public render(): React.ReactNode {
    return this.props.children;
  }
}
