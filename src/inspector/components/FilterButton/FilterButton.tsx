/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import "./FilterButton.less";
import { TSubTypes } from "../../model/types";
import { IconEye } from "../../../shared/components/icons";

export type TState = "on" | "off" | "semi";

export interface IFilterButtonProps {
	state:TState
	subtype: TSubTypes | "main"
	onClick: (id: TSubTypes | "main", state: TState, e:React.MouseEvent<HTMLDivElement, MouseEvent>) => void
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

	public render(): JSX.Element {
		const { state,onClick,subtype } = this.props;
		
		return (
			<div className={"FilterButton" + " " + state} onClick={(e) => onClick(subtype, state, e)} title="Filter">
				<div className="icon"><IconEye /></div>
			</div>
		);
	}
}