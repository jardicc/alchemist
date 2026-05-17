
import React from "react";

export interface ITabPanelProps {
	id: string
	marginRight?: boolean
	title: string | JSX.Element
	noPadding?: boolean
	showScrollbars?: boolean
	children: JSX.Element | JSX.Element[]
}

export const TabPanel: React.FC<ITabPanelProps> = (props) => {
	return <>{props.children}</>;
};
