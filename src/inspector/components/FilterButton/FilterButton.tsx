/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import "./FilterButton.less";
import { TSubTypes } from "../../model/types";

export interface IFilterButtonProps {
	state: "on" | "off" | "semi"
	subtype: TSubTypes | "main"
	onClick: (id: TSubTypes | "main", state: "on" | "off" | "semi") => void
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
		const { state,onClick,subtype } = this.props;
		
		return (
			<div className={"FilterButton"+ state==="off" ? " notPushed": " pushed"} onClick={()=>onClick(subtype,state)}>
				{this.content()}
			</div>
		);
	}
}