/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import "./FilterButton.less";

export interface IFilterButtonProps{
	state: "on"|"off"|"semi"
	onClick:(id:string)=>void
}

export interface IFilterButtonDispatch {
	
}

interface IFilterButtonState{
	
}

export type TFilterButton = IFilterButtonProps & IFilterButtonDispatch

export class FilterButton extends React.Component<TFilterButton, IFilterButtonState> { 
	constructor(props: TFilterButton) {
		super(props);

		this.state = {
		};
	}

	private content = () => {
		switch (this.props.state) {
			case "off": return "Off";
			case "semi": return "On";
			case "on": return "On";
		}
	}

	public render(): JSX.Element {
		const { state,onClick } = this.props;
		
		return (
			<div className={"FilterButton"+ state==="off" ? " notPushed": " pushed"} onClick={()=>onClick}>
				{this.content()}
			</div>
		);
	}
}