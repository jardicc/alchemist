import React from 'react'
import './Filter.css'
import { TFilterEvents } from '../reducers/initialState'

export interface IFilterProps{
	filterType: TFilterEvents
	include: string
	exclude: string
	searchEvent:string|null
}

export interface IFilterDispatch{
	setSearchTerm(str: string): void
	setFilterEventsType(type: TFilterEvents): void
	setInclude(arr:string[]):void
	setExclude(arr:string[]):void
}

type TFilter = IFilterProps & IFilterDispatch

export default class Filter extends React.Component<TFilter> {
	constructor(props: TFilter) {
		super(props)
	}

	private onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setSearchTerm(e.currentTarget.value);
	}

	private onSetFilterEventsType = (e: any) => {
		this.props.setFilterEventsType(e.target.value)
	}

	private setExclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setExclude(e.currentTarget.value.split(";"));
	}

	private setInclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setInclude(e.currentTarget.value.split(";"));
	}

	private renderFilterFields = () => {
		switch (this.props.filterType) {
			case "exclude": {
				return (
					<React.Fragment>
						<span>Exclude: </span><input onChange={this.setExclude} value={this.props.exclude} type="text" />
					</React.Fragment>
				)
			}
			case "include": {
				return (
					<React.Fragment>
						<span>Include: </span><input onChange={this.setInclude} value={this.props.include} type="text" />
					</React.Fragment>
				);
			}
			case "none": {
				return null
			}
		}
	}

	public render() {
		return (
			<React.Fragment>
				<div className="FilterComponent">
					<span>Search: </span><input onChange={this.onSearch} value={this.props.searchEvent||""} type="text" />
					<span>Filter:</span>
					<sp-dropdown>
						<sp-menu slot="options" onClick={this.onSetFilterEventsType}>
							<sp-menu-item value="none">None</sp-menu-item>
							<sp-menu-item value="include">Include</sp-menu-item>
							<sp-menu-item value="exclude">Exclude</sp-menu-item>
						</sp-menu>
					</sp-dropdown>
				</div>
				<div className="ExcludeInclude">
					{this.renderFilterFields()}
				</div>
			</React.Fragment>
		);
	}
}
