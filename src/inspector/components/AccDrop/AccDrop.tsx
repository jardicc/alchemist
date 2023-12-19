import React, {ComponentType, ReactElement} from "react";
import {IconChevronBottom, IconChevronRight, IconChevronTop} from "../../../shared/components/icons";
import {IPropertyGroup, IPropertyItem} from "../../model/types";
import SP from "react-uxp-spectrum";
import "./AccDrop.less";
import {getIcon} from "../../helpers";

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
	//open: boolean
}

export type TAccDrop = IAccDropProps & IAccDropDispatch

export class AccDrop extends React.Component<TAccDrop, IAccDropState> {

	private searchRef: React.RefObject<HTMLDivElement>;
	private popoverRef: React.RefObject<HTMLDivElement>;

	constructor(props: TAccDrop) {
		super(props);

		this.searchRef = React.createRef();
		this.popoverRef = React.createRef();


		this.state = {
			searchValue: "",
			//open: false,
		};
	}


	private headerClick = async () => {
		const opened = this.popoverRef.current?.hasAttribute("open") ?? false;
		if (this.props.onHeaderClick) {
			await this.props.onHeaderClick(this.props.id, opened);
		}
		/*
		this.setState({
			...this.state,
			open: !opened,
		});
		*/
	};


	private getLabel = () => {

		const newList: IPropertyItem[] = [];

		this.props.items.forEach(item => {
			if ("group" in item) {
				newList.push(...item.data);
			} else {
				newList.push(item);
			}
		});

		const labels = newList.filter(item =>
			this.props.selected.includes(item.value),
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

	private renderGroup = (group: IPropertyGroup) => {
		return (
			<React.Fragment key={"f_" + group.group}>
				<div className="groupHeader" key={"g_" + group.group}>{group.groupLabel}</div>
				<div key={"gw_" + group.group} className="groupWrapper">
					{
						group.data.map(item => this.renderItem(item))
					}
				</div>
			</React.Fragment>
		);
	};

	private renderSearchField = () => {
		if (!this.props.showSearch) {
			return null;
		}
		return (
			<div className="searchField">
				<SP.Textfield
					value={this.state.searchValue}
					className="filterContent"
					type="search"
					//placeholder="Filter..."
					key="search"
					onChange={(e) => {
						console.log(e);


					}}
					onInput={(e) => {
						console.log(e);
						this.setState({
							...this.state,
							searchValue: (e.target?.value ?? ""),
						});
					}}
				/>
			</div>
		);
	};

	private renderItem = (item: IPropertyItem) => {
		const {id, selected, onSelect, showSearch, ItemPostFix, icons} = this.props;
		if (
			showSearch && item.label.toLocaleLowerCase().includes((this.state.searchValue.toLocaleLowerCase())) ||
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
							this.popoverRef.current?.removeAttribute("open");
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

	private renderContent = (): React.ReactNode => {
		const {id, items} = this.props;

		return (
			<div key={"c_" + id} className={"container " + (this.props.className || "")}>
				{
					items.map((item) => {
						if ("group" in item) {
							//return null;
							return this.renderGroup(item);
						} else {
							return this.renderItem(item);
						}
					})
				}
			</div>
		);
	};



	public override render(): JSX.Element {
		const {id, className, header, headerPostFix} = this.props;

		return (
			<div className="AccDrop">
				<div key={"h_" + id} className={"header " + (className || "")}>

					<sp-overlay class="overlay">
						<div slot="trigger" className="triggerGroup" onMouseDown={this.headerClick}>
							<div className="titleType">{header}</div>
							<div className="title">{this.getLabel()}</div>

							{this.renderSearchField()}
						</div>

						<sp-popover
							ref={this.popoverRef}
							placement="auto"
							alignment="auto"
							slot="click"
							//open={this.state.open ? "open" : undefined}
							class="popover"
						>
							<div className="popoverContent">
								{this.renderContent()}

							</div>
						</sp-popover>
					</sp-overlay>

					{headerPostFix}
					{
						/*
							<div className="chevron">
								{this.state.expanded ? <IconChevronTop /> : <IconChevronBottom />}
							</div>
							*/
					}
				</div>


			</div>

		);
	}
}