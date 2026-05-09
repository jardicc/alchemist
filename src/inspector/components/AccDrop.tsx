import React, {ComponentType, ReactElement} from "react";
import {IconChevronBottom, IconChevronRight, IconChevronTop} from "../../shared/components/icons";
import {IPropertyGroup, IPropertyItem} from "../model/types";
import SP from "react-uxp-spectrum";
import "./AccDrop.less";
import {getIcon} from "../helpers";

export interface IAccDropPostFixProps {
	value: string
}

export interface IAccDropIcons {
	[key: string]: JSX.Element
}

export interface IAccDropProps {
	id: string
	items: (IPropertyItem | IPropertyGroup)[]
	header: string | React.ReactElement

	onSelect: (id: string, value: string | number, toggle?: boolean) => void
	selected: (string | number)[]

	className?: string
	onHeaderClick?: (id: string, expanded: boolean) => Promise<void>
	showSearch?: boolean
	headerPostFix?: ReactElement
	ItemPostFix?: ComponentType<IAccDropPostFixProps>

	supportMultiSelect?: boolean
	icons?: boolean // exists only for main type
}

export interface IAccDropDispatch {

}

interface IAccDropState {
	searchValue: string
	open: boolean
}

export type TAccDrop = IAccDropProps & IAccDropDispatch

export const AccDrop: React.FC<TAccDrop> = (props) => {
	const searchRef = React.useRef<HTMLDivElement>(null);
	const popoverRef = React.useRef<HTMLDivElement>(null);

	const [searchValue, setSearchValue] = React.useState("");
	const [open, setOpen] = React.useState(false);

	const headerClick = async () => {
		const opened = popoverRef.current?.hasAttribute("open") ?? false;
		if (props.onHeaderClick) {
			await props.onHeaderClick(props.id, opened);
		}

		if (!opened) {
			// brute force checking because there is no event for closing
			const intervalID = setInterval(() => {
				const stillOpened = popoverRef.current?.hasAttribute("open") ?? false;
				if (!stillOpened) {
					setOpen(false);
					clearInterval(intervalID);
				}
			}, 100);
		}

		setOpen(!opened);
	};


	const getLabel = () => {

		const newList: IPropertyItem[] = [];

		props.items.forEach(item => {
			if ("group" in item) {
				newList.push(...item.data);
			} else {
				newList.push(item);
			}
		});

		const labels = newList.filter(item =>
			props.selected.includes(item.value),
		).map(item => item.label);

		if (!labels.length) {
			return "n/a";
		}
		else if (labels.length === 1) {
			return labels[0];
		}
		else {
			return `${labels[0]} +(${labels.length - 1})`;
		}

	};

	const renderGroup = (group: IPropertyGroup) => {
		return (
			<React.Fragment key={"f_" + group.group}>
				<div className="groupHeader" key={"g_" + group.group}>{group.groupLabel}</div>
				<div key={"gw_" + group.group} className="groupWrapper">
					{
						group.data.map(item => renderItem(item))
					}
				</div>
			</React.Fragment>
		);
	};

	const renderSearchField = () => {
		if (!props.showSearch) {
			return null;
		}
		if (!open) {
			return null;
		}
		return (
			<div className="searchField">
				<SP.Textfield
					value={searchValue}
					className="filterContent"
					type="search"
					//placeholder="Filter..."
					key="search"
					onChange={(e) => {
						console.log(e);


					}}
					onInput={(e) => {
						console.log(e);
						setSearchValue(e.target?.value ?? "");
					}}
				/>
			</div>
		);
	};

	const renderItem = (item: IPropertyItem) => {
		const {id, selected, onSelect, showSearch, ItemPostFix, icons} = props;
		if (
			showSearch && item.label.toLocaleLowerCase().includes((searchValue.toLocaleLowerCase())) ||
			!showSearch
		) {
			return (
				<div
					className="item"
					key={"i_" + item.value + id}
					onClick={(e) => {
						e.stopPropagation();
						if (e.ctrlKey || e.metaKey) {
							onSelect(id, item.value, true);
						} else {
							onSelect(id, item.value);
							popoverRef.current?.removeAttribute("open");
						}

					}}
					data-selected={selected.includes(item.value) || undefined}
				>
					<div className="label">
						{icons && <div className="icon">{getIcon(item.value as any)}</div>} <span>{item.label}</span>
					</div>
					{
						// filter within main category dropdown
						ItemPostFix && <div
							className="itemPostFix"
						><ItemPostFix value={item.value.toString()} /></div>
					}
				</div>
			);
		}
		return null;
	};

	const renderContent = (): React.ReactNode => {
		const {id, items} = props;

		return (
			<div key={"c_" + id} className={"container " + (props.className || "")}>
				{
					items.map((item) => {
						if ("group" in item) {
							//return null;
							return renderGroup(item);
						} else {
							return renderItem(item);
						}
					})
				}
			</div>
		);
	};

	const {id, className, header, headerPostFix} = props;

	return (
		<div className="AccDrop">
			<div key={"h_" + id} className={"header " + (className || "")}>

				{

					<sp-popover
						ref={popoverRef}
						placement="auto"
						alignment="auto"
						open={open ? "open" : undefined}
						class="popover"

					>
						<div className="popoverContent">
							{renderContent()}

						</div>
						<div slot="anchor" className="triggerGroup" onClick={headerClick}>
							<div className="titleType">{header}</div>
							<div className="title">{getLabel()}</div>

							{renderSearchField()}
						</div>
					</sp-popover>

				}

				{headerPostFix}
			</div>


		</div>

	);
};