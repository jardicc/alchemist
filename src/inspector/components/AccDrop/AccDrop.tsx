/* eslint-disable @typescript-eslint/no-empty-interface */
import React, {ReactElement} from "react";
import {IconCaretRight, IconChevronBottom, IconChevronRight} from "../../../shared/components/icons";
import {TBaseItems} from "../../model/properties";
import {IPropertyItem} from "../../model/types";
import "./AccDrop.less";

export interface IAccDropProps {
	id: string
	className?: string
	header: string | React.ReactElement
	onChange?: (id: string, expanded: boolean) => void
	onSelect: (id: string, value: string) => void
	items: TBaseItems | IPropertyItem[]
	selected: string[]
	headerPostFix?: ReactElement
}

export interface IAccDropDispatch {
	
}

interface IAccDropState{
	expanded: boolean
}

export type TAccDrop = IAccDropProps & IAccDropDispatch

export class AccDrop extends React.Component<TAccDrop, IAccDropState> { 
	constructor(props: TAccDrop) {
		super(props);

		this.state = {
			expanded: false,
		};
	}

	private onHeaderClick = () => {
		if(this.props.onChange){
			this.props.onChange(this.props.id, !this.state.expanded);
		}
		this.setState({
			...this.state,
			expanded: !this.state.expanded,
		});
	}

	private getLabel = () => {

		const labels = [...this.props.items].filter(item => {
			if ("stringID" in item) {
				return this.props.selected.includes(item.stringID);
			} else {
				return this.props.selected.includes(item.value);
			}
		}).map(item => {
			if ("stringID" in item) {
				return item.title;
			} else {
				return item.label;
			}
		});

		return labels.join(", ");
	}

	private renderHeader = (): JSX.Element => {
		return (
			<div className="header" onClick={this.onHeaderClick}>
				<div className="chevron">
					{this.state.expanded ? <IconChevronBottom />:<IconChevronRight />}

				</div>
				<span className="title">{this.props.header + " " + this.getLabel()}</span>
				{this.props.headerPostFix}
			</div>
		);
	}

	private renderContent = (): React.ReactNode => {
		const {id, selected, items, onSelect} = this.props;

		if (!this.state.expanded) {
			return null;
		}


		return (
			<div className="container">
				{
					items.map(item => {
						if ("stringID" in item) {
							return (
								<div
									className="item"
									key={item.stringID}
									onClick={(e) => {
										onSelect(id, item.stringID);
										e.stopPropagation();
	
									}}
									data-selected={selected.includes(item.stringID) || undefined}
								>{item.title}</div>
							);
						} else {
							return (
								<div
									className="item"
									key={item.value}
									onClick={(e) => {
										onSelect(id, item.value);
										e.stopPropagation();
	
									}}
									data-selected={selected.includes(item.value) || undefined}
								>{item.label}</div>
							);
						}
					})
				}
			</div>
		);
	}

	public render(): JSX.Element {
		
		return (
			<div className={"AccDrop "+(this.props.className||"")}>
				{this.renderHeader()}
				{this.renderContent()}
			</div>
		);
	}
}