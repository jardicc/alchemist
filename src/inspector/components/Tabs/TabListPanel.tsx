
import React from "react";

export interface ITabPanelProps {
	id: string
	marginRight?: boolean
	title: string | JSX.Element
	noPadding?: boolean
	showScrollbars?: boolean
	children: JSX.Element | JSX.Element[]
}

export interface ITabPanelDispatch {

}

export interface ITabPanelState {

}

export type TTabPanel = ITabPanelProps & ITabPanelDispatch
export type TTabPanelComponent = React.FC<TTabPanel>

export const TabPanel: React.FC<TTabPanel> = (props) => {
	return <>{props.children}</>;
};
