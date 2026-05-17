
import React from "react";
import {IconChevronBottom, IconChevronRight} from "../../shared/components/icons";
import "./Accordion.less";

export interface IFilterButtonProps {
	id: string
	className?: string
	children: React.ReactElement | React.ReactElement[]
	header: string | React.ReactElement
	onChange: (id: string, expanded: boolean) => void
	expanded: boolean | string[]
}

export const Accordion: React.FC<IFilterButtonProps> = (props) => {
	const isExpanded = typeof props.expanded === "boolean"
		? props.expanded
		: props.expanded.includes(props.id);

	const onHeaderClick = () => {
		props.onChange(props.id, !isExpanded);
	};

	const renderHeader = (): JSX.Element => {
		return (
			<div className="header" onClick={onHeaderClick}>
				{isExpanded ? <IconChevronBottom /> : <IconChevronRight />}
				<span className="title">{props.header}</span>
			</div>
		);
	};

	const renderContent = (): React.ReactNode => {
		const {children} = props;
		if (!isExpanded) {
			return null;
		}

		return (
			<div className="container">
				{children}
			</div>
		);
	};

	return (
		<div className={"Accordion " + (props.className || "")}>
			{renderHeader()}
			{renderContent()}
		</div>
	);
};
