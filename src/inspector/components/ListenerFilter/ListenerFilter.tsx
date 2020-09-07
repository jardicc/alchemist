import React from "react";
import { TSubTypes, ISettings, TFilterEvents, TTargetReference, TListenerCategoryReference, IContentWrapper } from "../../model/types";
import { TBaseItems, baseItemsListener } from "../../model/properties";
import { TState, FilterButton } from "../FilterButton/FilterButton";


export interface IListenerFilterProps{
	settings: ISettings
	selectedTargetReference: TTargetReference
	activeTargetReferenceListenerCategory: IContentWrapper<TListenerCategoryReference>
}

export interface IListenerFilterDispatch {
	setFilterEventsType(type: TFilterEvents): void
	setInclude(arr:string[]):void
	setExclude(arr: string[]): void
	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main", state: TState) => void
}


type TListenerFilter = IListenerFilterProps & IListenerFilterDispatch

interface IState{
	
}

export class ListenerFilter extends React.Component<TListenerFilter, IState> { 
	constructor(props: TListenerFilter) {
		super(props);
	}

	
	private setExclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setExclude(e.currentTarget.value.split(";"));
	}

	private setInclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setInclude(e.currentTarget.value.split(";"));
	}

	private renderFilterFields = () => {
		const {listenerExclude,listenerInclude } = this.props.settings;
		switch (this.props.settings.listenerFilterType) {
			case "exclude": {
				return (
					<React.Fragment>
						<div className="label">Exclude: </div><input onChange={this.setExclude} value={listenerExclude.join(";")} type="text" />
					</React.Fragment>
				);
			}
			case "include": {
				return (
					<React.Fragment>
						<div className="label">Include: </div><input onChange={this.setInclude} value={listenerInclude.join(";")} type="text" />
					</React.Fragment>
				);
			}
			case "none": {
				return null;
			}
		}
	}

	private onSetFilterEventsType = (e: any) => {
		this.props.setFilterEventsType(e.target.value);
	}

	private dropdownClick = async (type: "listenerCategory") => {
		switch (type) {
			case "listenerCategory":
				break;
		}
	}

	private buildFilterRow = (
		label: string,
		subType: "listenerCategory",
		items: TBaseItems,
		content: {value:string|null|number,filterBy:TState}
	): React.ReactNode => {
		return (
			<div className="filter">
				<div className="label">{label}</div>
				<sp-dropdown quiet="true" onMouseDown={() => this.dropdownClick(subType)}>
					<sp-menu slot="options" onClick={(e: React.ChangeEvent<HTMLSelectElement>) => { console.log(e); }}>
						{
							items.map(item => (
								<sp-menu-item
									key={item.value}
									value={item.value}
									selected={content.value === item.value ? "selected" : null}
								>{item.label}</sp-menu-item>
							))
						}
					</sp-menu>
				</sp-dropdown>
				<FilterButton subtype={subType} state={content.filterBy} onClick={(subtype, state) => this.props.onSetFilter(this.props.selectedTargetReference, subtype, state)} />
			</div>
		);
	}

	public render(): JSX.Element {
		const {settings:{listenerFilterType},activeTargetReferenceListenerCategory } = this.props;
		return (
			<React.Fragment>
				<div className="category">
					{this.buildFilterRow("Category","listenerCategory",baseItemsListener,activeTargetReferenceListenerCategory)}
				</div>
				<div className="filter excludeIncludeDropdownRow">
					<div className="label">Filter:</div>
					<sp-dropdown quiet="true">
						<sp-menu slot="options" onClick={this.onSetFilterEventsType}>
							{
								[{ value: "none", label: "None" }, { value: "include", label: "Include" }, { value: "exclude", label: "Exclude" }]
									.map(item => (
										<sp-menu-item
											key={item.value}
											value={item.value}
											selected={listenerFilterType === item.value ? "selected" : null}
										>{item.label}</sp-menu-item>
									))
							}
						</sp-menu>
					</sp-dropdown>
				</div>
				<div className="excludeIncludeInput">
					{this.renderFilterFields()}
				</div>
			</React.Fragment>
		);
	}
}