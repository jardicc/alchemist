
import React from "react";
import clsx from "clsx";
import "./TabList.less";

interface ITabListProps {
	activeKey: string
	className: string
	children: React.ReactElement[]
	postFix?: React.ReactElement
	onChange: <T extends string>(id: T) => void
}

interface ITabRowProps {
	activeKey: string
	children: React.ReactElement[]
	postFix?: React.ReactElement
	onChange: <T extends string>(id: T) => void
}

interface ITabContentProps {
	activeKey: string
	children: React.ReactElement[]
}


const TabRow: React.FC<ITabRowProps> = ({activeKey, children, postFix, onChange}) => (
	<div className="tabRow">
		{children.map(item => (
			<div
				className={clsx("tabHeader", {"active": item.props.id === activeKey})}
				key={item.props.id}
				onClick={() => {
					onChange(item.props.id);
				}}
				style={item.props.marginRight && {marginRight: "auto"}}
			>{item.props.title}</div>
		))}
		{postFix}
	</div>
);

const TabContent: React.FC<ITabContentProps> = ({activeKey, children}) => {
	if (Array.isArray(children)) {
		const found = children.find(item => item.props.id === activeKey);
		if (!found) {
			return <div className="tabContent">No content</div>;
		}
		if (typeof found === "object" && "props" in found) {
			const {id, showScrollbars, noPadding} = found.props;
			return <div className={clsx("tabContent", {"showScrollbars": showScrollbars, "noPadding": noPadding}, id)}>{found}</div>;
		}
	}
	return <div className="tabContent">not array</div>;
};

export const TabList: React.FC<ITabListProps> = ({activeKey, className, children, postFix, onChange}) => (
	<div className={clsx("TabList", className)}>
		{Array.isArray(children) && (
			<TabRow activeKey={activeKey} onChange={onChange} postFix={postFix}>{children}</TabRow>
		)}
		<TabContent activeKey={activeKey}>{children}</TabContent>
	</div>
);

