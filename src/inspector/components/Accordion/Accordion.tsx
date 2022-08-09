/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import "./Accordion.less";

export interface IAccordionProps{
	id:string
	className?: string
	children: React.ReactElement|React.ReactElement[]
	header: string | React.ReactElement
	onChange: (id: string, expanded:boolean) => void
	expanded: boolean|string[]
}

export interface IAccordionDispatch {
	
}

interface IAccordionState{
	
}

export type TAccordion = IAccordionProps & IAccordionDispatch

export class Accordion extends React.Component<TAccordion, IAccordionState> { 
	constructor(props: TAccordion) {
		super(props);

		this.state = {
		};
	}

	private get isExpanded() {
		if (typeof this.props.expanded === "boolean") {
			return this.props.expanded;
		} else {
			return this.props.expanded.includes(this.props.id);
		}
	}

	private onHeaderClick = () => {
		this.props.onChange(this.props.id, !this.isExpanded);
	}

	private renderHeader = (): JSX.Element => {
		return (
			<div className="header" onClick={this.onHeaderClick}>
				<span className="title">{this.props.header}</span>
			</div>
		);
	}

	private renderContent = (): React.ReactNode => {
		const {children} = this.props;
		if (!this.isExpanded) {
			return null;
		}

		return (
			<div className="container">
				{children}
			</div>
		);
	}

	public render(): JSX.Element {
		
		return (
			<div className={"Accordion "+(this.props.className||"")}>
				{this.renderHeader()}
				{this.renderContent()}
			</div>
		);
	}
}