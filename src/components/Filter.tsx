import React from 'react'
import { IAction, IPlayReply, TFilterEvents } from '../reducers/initialState'
import { ActionDescriptor } from 'photoshop/dist/types/photoshop'
import { action } from '../imports'
import './Filter.css'

export interface IFilterProps{

}

export interface IFilterDispatch{
	setSearchTerm(str: string): void
	setFilterEventsType(type:TFilterEvents):void
}

type TFilter = IFilterProps & IFilterDispatch

export default class Filter extends React.Component<TFilter> {
	constructor(props: TFilter) {
		super(props)
	}

	private onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setSearchTerm(e.currentTarget.value);
	}

	private onSetFilterEventsType = (e:any,type:TFilterEvents) => {
		debugger;
		this.props.setFilterEventsType(e)
	}

	public render() {
		return (
			<React.Fragment>
				<div className="FilterComponent">
					<span>Search: </span><input onChange={this.onSearch} type="text" />


					{/*<input onChange={this.onSearch} type="text" />*/}
				</div>
			</React.Fragment>
		)
	}
}
