
import React from "react";
import "./TabList.less";

export interface ITabListProps {
	activeKey: string
	className: string
	children: React.ReactElement[]
	postFix?: React.ReactElement
	onChange: (id: any) => void
}

export interface ITabListDispatch {

}

interface ITabListState {

}

export type TTabList = ITabListProps & ITabListDispatch

export const TabList: React.FC<TTabList> = (props) => {
	const renderTabs = (): JSX.Element | null => {
		const {activeKey} = props;
		if (Array.isArray(props.children)) {
			return (
				<div className="tabRow">
					{props.children.map(item => (
						<div
							className={"tabHeader" + ((item.props.id === activeKey) ? " active" : "")}
							key={item.props.id}
							onClick={() => {
								console.log(item.props.id);
								props.onChange(item.props.id);
							}}
							style={item.props.marginRight && {marginRight: "auto"}}
						>{item.props.title}</div>
					))}
					{props.postFix}
				</div>
			);
		}
		return null;
	};

	const renderTabContent = (): React.ReactNode => {
		const {activeKey, children} = props;

		let clsName = "tabContent ";

		if (Array.isArray(children)) {
			const found = children.find(item => item.props.id === activeKey);
			if (!found) {
				return <div className={clsName}>No content</div>;
			}
			else if (typeof found === "object" && "props" in found) {
				clsName += (found.props.showScrollbars ? "showScrollbars " : "");
				clsName += found.props.noPadding ? "noPadding " : "";
				return <div className={clsName + found.props.id}>{found}</div>;
			}
		}
		return <div className={clsName}>not array</div>;
	};

	return (
		<div className={"TabList " + (props.className || "")}>
			{renderTabs()}
			{renderTabContent()}
		</div>
	);
};
