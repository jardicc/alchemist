/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import { TTabPanelComponent } from "./TabPanel";
import "./TabList.less";
import { iteratorSymbol } from "immer/dist/internal";

export interface ITabListProps{
	activeKey: string
	className: string
	children: React.ReactNode
	onChange:(id:string)=>void
}

export interface ITabListDispatch {
	
}

interface ITabListState{
	
}

export type TTabList = ITabListProps & ITabListDispatch

export class TabList extends React.Component<TTabList, ITabListState> { 
	constructor(props: TTabList) {
		super(props);

		this.state = {
		};
	}

	private renderTabs = (): JSX.Element | null => {
		const { activeKey } = this.props;
		if (Array.isArray(this.props.children)) {
			return (
				<div className="tabRow">
					{this.props.children.map((item: TTabPanelComponent) => (
						<div className={"tabHeader" + ((item.props.id === activeKey) ? " active" : "")} key={item.props.id} onClick={() => {
							console.log(item.props.id);
							this.props.onChange(item.props.id);
						}}>{item.props.title}</div>
					))}
				</div>
			);
		}
		return null;
	}

	private renderTabContent = (): React.ReactNode => {
		const { activeKey, children } = this.props;

		if (Array.isArray(children)) {
			const found = children.find((item: TTabPanelComponent) => item.props.id === activeKey);
			if (!found) {
				return <div className={"tabContent "}>No content</div>;
			}
			else if (typeof found === "object" && "props" in found) {
				
				const noPaddingClassName = found.props.noPadding ? "noPadding " : "";
				return <div className={"tabContent " + noPaddingClassName + found.props.id}>{found}</div>;
			}
		}
		return <div className={"tabContent "}>not array</div>;
	}

	public render(): JSX.Element {
		
		return (
			<div className={"TabList "+(this.props.className||"")}>
				{this.renderTabs()}
				{this.renderTabContent()}
			</div>
		);
	}
}