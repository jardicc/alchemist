// App imports
import React from "react";
import "./App.less";

import {ListenerContainer} from "./ListenerContainer";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAppProps{
	
}

export interface IAppDispatch{
		setWholeState():void
}

type TApp = IAppProps & IAppDispatch

export class App extends React.Component<TApp> {
	constructor(props: TApp) {
		super(props);
	}
	
	public render(): JSX.Element {
		return (
			<div className="panel">
				<ListenerContainer />
			</div>
		);
	}
	
	public componentDidMount(): void {
		this.props.setWholeState();
	}
}
