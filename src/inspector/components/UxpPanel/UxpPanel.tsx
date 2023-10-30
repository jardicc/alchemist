/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import "./UxpPanel.less";
import {ErrorBoundary} from "../ErrorBoundary/ErrorBoundary";
import {NotificationContainer} from "react-notifications";
import {core} from "photoshop";

export interface IUxpPanelProps {
	panelId: string;
	className?: string;
	children?: React.ReactNode;
}

export interface IUxpPanelDispatch {
	
}

interface IUxpPanelState{
	
}

export type TUxpPanel = IUxpPanelProps & IUxpPanelDispatch

export class UxpPanel extends React.Component<TUxpPanel, IUxpPanelState> { 
	constructor(props: TUxpPanel) {
		super(props);

		this.state = {

		};

		core.suppressResizeGripper({"type": "panel", "target": props.panelId, "value": true});
	}

	public render(): JSX.Element {
		const {className, panelId,children} = this.props;

		return (
			<uxp-panel panelid={panelId} class={className}>
				<ErrorBoundary>
					<NotificationContainer />
					{children}
				</ErrorBoundary>
			</uxp-panel>
		)
	}
}