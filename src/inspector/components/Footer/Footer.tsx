import React from "react";
import "./Footer.css";


export interface IFooterProps{
}

export interface IFooterDispatch {
	onClear:()=>void
}


export type TFooter = IFooterProps & IFooterDispatch
export type TFooterComponent = React.Component<TFooter>

export class Footer extends React.Component<TFooter> { 
	constructor(props: TFooter) {
		super(props);
	}

	public render():React.ReactNode{
		return (
			<div className="Footer">
				<div className="button" onClick={()=>this.props.onClear()}>Clear</div>
				<div className="button">Clear view</div>
				<div className="button">Clear non-existent</div>
				<div className="spread"></div>
				<div className="button">Import</div>
				<div className="button">Export</div>
			</div>
		);
	}
}