/* eslint-disable @typescript-eslint/no-empty-interface */
import React, {ComponentType, ReactElement} from "react";
import {IconCaretRight, IconChevronBottom, IconChevronRight} from "../../../shared/components/icons";
import {TBaseItems} from "../../model/properties";
import {IPropertyGroup, IPropertyItem} from "../../model/types";
import SP from "react-uxp-spectrum";
import "./AccDrop.less";

export interface IAccDropPostFixProps{
	value:string
}

export interface IAccDropProps {
	id: string
	className?: string
	header: string | React.ReactElement
	onChange?: (id: string, expanded: boolean) => void
	onSelect: (id: string, value: string) => void
	showSearch?: boolean
	items: (IPropertyItem | IPropertyGroup)[]
	selected: string[]
	headerPostFix?: ReactElement
	ItemPostFix?: ComponentType<IAccDropPostFixProps>
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
			calcHeight: props.items.length*1.5,
			searchValue: "",
		};
	}

	private onHeaderClick = () => {
		if(this.props.onChange){
			this.props.onChange(this.props.id, !this.state.expanded);
		}
		this.toggleExpanded();
	}

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
	}

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

		return labels.join(", ");
	}

	private renderHeader = (): JSX.Element => {
		const {id, className, header, headerPostFix} = this.props;

		return (
			<div key={"h_"+id} className={"AccDrop header " + (className || "")} onClick={this.onHeaderClick}>
				<div className="chevron">
					{this.state.expanded ? <IconChevronBottom />:<IconChevronRight />}

				</div>
				<span className="title">{header + " " + this.getLabel()}</span>				
				{headerPostFix}
			</div>
		);
	}

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
	}

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
	}

	private renderItem = (item: IPropertyItem) => {
		const {id, selected, onSelect, showSearch, ItemPostFix} = this.props;
		if (
			showSearch && item.label.toLocaleLowerCase().includes((this.state.searchValue.toLocaleLowerCase())) || 
			!showSearch
		) {
			return (
				<div
					className="item"
					key={"i_"+item.value+id}
					onClick={(e) => {
						onSelect(id, item.value);
						e.stopPropagation();
						// this.toggleExpanded();
					}}
					data-selected={selected.includes(item.value) || undefined}
				>
					<div className="label">
						{item.label}
					</div>
					{
						ItemPostFix && <div 
							className="itemPostFix"
						><ItemPostFix value={item.value} /></div>
					}
				</div>
			);			
		}
		return null;
	}

	private renderContent = (): React.ReactNode => {
		const {id, selected, items, onSelect} = this.props;
		const {calcHeight} = this.state;

		if (!this.state.expanded) {
			return null;
		}

		const containerMaxHeight: React.CSSProperties = {};

		if (calcHeight !== null) {
			containerMaxHeight.maxHeight = (calcHeight + 1) + "em";
		}

		return (
			<div key={"c_" + id} className={"AccDrop container " + (this.props.className || "")} style={containerMaxHeight}>
				<div className="measureHeightWrapper" ref={this.heightRef}>
					{
						items.map((item, index) => {
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
	}
	
	
	componentDidUpdate(prevProps: Readonly<TAccDrop>, prevState: Readonly<IAccDropState>, snapshot?: any): void {
		if (this.heightRef) {
			const height = this.props.items.length * 1.5;

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