import React, {ComponentType, ReactElement} from "react";
import {IconChevronBottom, IconChevronRight, IconChevronTop} from "../../../shared/components/icons";
import {IPropertyGroup, IPropertyItem} from "../../model/types";
import SP from "react-uxp-spectrum";
import "./AccDrop.less";
import {getIcon} from "../../helpers";

export interface IAccDropPostFixProps{
	value:string
}

export interface IAccDropIcons{	
	[key: string]:JSX.Element
}

export interface IAccDropProps {
	id: string
	items: (IPropertyItem | IPropertyGroup)[]
	header: string | React.ReactElement
	
	onSelect: (id: string, value: string|number, toggle?:boolean) => void	
	selected: (string|number)[]

	className?: string
	onHeaderClick?: (id: string, expanded: boolean) => Promise<void>
	showSearch?: boolean
	headerPostFix?: ReactElement
	ItemPostFix?: ComponentType<IAccDropPostFixProps>
	doNotCollapse?: boolean
	
	supportMultiSelect?:boolean
	icons?: boolean // exists only for main type
}

export interface IAccDropDispatch {
	
}

interface IAccDropState{
	expanded: boolean
	calcHeight: number
	searchValue: string
}

export type TAccDrop = IAccDropProps & IAccDropDispatch

export class AccDrop extends React.Component<TAccDrop, IAccDropState> { 

	private searchRef: React.RefObject<HTMLDivElement>;
	private heightRef: React.RefObject<HTMLDivElement>;

	constructor(props: TAccDrop) {
		super(props);

		this.searchRef = React.createRef();
		this.heightRef = React.createRef();


		this.state = {
			expanded: false,
			calcHeight: this.height,
			searchValue: "",
		};
	}

	private get height(): number {
		let height = 0;

		this.props.items.forEach(item => {
			height += 1.5;
			if ("data" in item) {
				height += item.data.length * 1.5;
			}
		});

		height += 1.5;		
		return height;
	}

	private headerClick = async () => {
		if(this.props.onHeaderClick){
			await this.props.onHeaderClick(this.props.id, !this.state.expanded);
		}
		this.toggleExpanded();
	};

	private toggleExpanded = () => {
		this.setState({
			...this.state,
			expanded: !this.state.expanded,
		},
		/*, () => {
			if (this.state.expanded) {
				(this.searchRef as any)?.current?.focus();
			}
		}*/);
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

	private renderHeader = (): JSX.Element => {
		const {id, className, header, headerPostFix} = this.props;

		return (
			<div key={"h_"+id} className={"AccDrop header " + (className || "")} onClick={this.headerClick}>
				<div className="titleType">{header}</div>
				<div className="group">
					<div className="title">{this.getLabel()}</div>				
					{headerPostFix}
					<div className="chevron">
						{this.state.expanded ? <IconChevronTop/>:<IconChevronBottom /> }
					</div>
				</div>
			</div>
		);
	};

	private renderGroup = (group: IPropertyGroup) => {
		return (
			<React.Fragment key={"f_"+group.group}>
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
		if (!this.props.showSearch || !this.state.expanded) {
			return null;
		}
		return (
			<div className="AccDrop searchField">
				<SP.Textfield
					value={this.state.searchValue}
					className="filterContent"
					type="search"
					placeholder="Filter..."
					key="search"
					// value={this.state.searchValue}
					onInput={(e) => this.setState({
						...this.state,
						searchValue: (e.target?.value ?? ""),
					})}
				/>
			</div>
		);
	};

	private renderItem = (item: IPropertyItem) => {
		const {id, selected, onSelect, showSearch, ItemPostFix, doNotCollapse, icons} = this.props;
		if (
			showSearch && item.label.toLocaleLowerCase().includes((this.state.searchValue.toLocaleLowerCase())) || 
			!showSearch
		) {
			return (
				<div
					className="item"
					key={"i_"+item.value+id}
					onClick={(e) => {
						e.stopPropagation();
						if (e.ctrlKey || e.metaKey) {
							onSelect(id, item.value, true);
						} else {
							onSelect(id, item.value);
							if (!doNotCollapse) {
								this.toggleExpanded();
							}							
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
		const {calcHeight} = this.state;

		if (!this.state.expanded) {
			return null;
		}

		const containerMaxHeight: React.CSSProperties = {};

		if (calcHeight !== null) {
			containerMaxHeight.maxHeight = calcHeight + "em";
		}

		return (
			<div key={"c_" + id} className={"AccDrop container " + (this.props.className || "")} style={containerMaxHeight}>
				<div className="measureHeightWrapper" ref={this.heightRef}>
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
			</div>
		);
	};
	
	
	componentDidUpdate(prevProps: Readonly<TAccDrop>, prevState: Readonly<IAccDropState>, snapshot?: any): void {
		if (this.heightRef) {
			const height = this.height;

			if (prevState.calcHeight === height) {
				return;
			}

			this.setState({
				...this.state,
				calcHeight: height,
			});
		}
	}
	

	public render(): JSX.Element {
		
		return (
			<>
				{this.renderHeader()}
				{this.renderSearchField()}
				{this.renderContent()}
			</>
		);
	}
}