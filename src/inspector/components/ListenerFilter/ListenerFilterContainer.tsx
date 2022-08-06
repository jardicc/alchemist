import { IRootState } from "../../../shared/store";
import { MapDispatchToPropsFunction, connect } from "react-redux";
import { getInspectorSettings, getSelectedTargetReference, getActiveTargetReference } from "../../selectors/inspectorSelectors";
import { setExcludeAction, setFilterTypeAction, setIncludeAction, setFilterStateAction, setTargetReferenceAction } from "../../actions/inspectorActions";
import React from "react";
import { TSubTypes, ISettings, TFilterEvents, TTargetReference, ITargetReference } from "../../model/types";
import { TState } from "../FilterButton/FilterButton";
import SP from "react-uxp-spectrum";

class ListenerFilter extends React.Component<TListenerFilter, Record<string, unknown>> { 
	constructor(props: TListenerFilter) {
		super(props);
	}
	
	private setExclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setExclude(e.currentTarget.value.split(";"));
	}

	private setInclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setInclude(e.currentTarget.value.split(";"));
	}

	private renderFilterFields = ():JSX.Element|null => {
		const {listenerExclude,listenerInclude } = this.props.settings;
		switch (this.props.settings.listenerFilterType) {
			case "exclude": {
				return (
					<>
						<div className="label">Exclude: </div><SP.Textfield onInput={this.setExclude as any} value={listenerExclude.join(";")} className="input" quiet />
					</>
				);
			}
			case "include": {
				return (
					<>
						<div className="label">Include: </div><SP.Textfield onInput={this.setInclude as any} value={listenerInclude.join(";")} className="input" quiet />
					</>
				);
			}
		}
		return null;
	}

	private onSetFilterEventsType = (e: any) => {
		this.props.setFilterEventsType(e.target.value);
	}

	public render(): JSX.Element {
		const {settings:{listenerFilterType} } = this.props;
		return (
			<>
				<div className="filter excludeIncludeDropdownRow">
					<div className="label">Filter:</div>
					<SP.Dropdown quiet={true}>
						<SP.Menu slot="options" onChange={this.onSetFilterEventsType}>
							{
								[
									{value: "none", label: "None"},
									{value: "include", label: "Include"},
									{value: "exclude", label: "Exclude"},
								].map(item => (
									<SP.MenuItem
										key={item.value}
										value={item.value}
										selected={listenerFilterType === item.value ? true : undefined}
									>{item.label}</SP.MenuItem>
								))
							}
						</SP.Menu>
					</SP.Dropdown>
				</div>
				<div className="excludeIncludeInput">
					{this.renderFilterFields()}
				</div>
			</>
		);
	}
}


type TListenerFilter = IListenerFilterProps & IListenerFilterDispatch

interface IListenerFilterProps{
	settings: ISettings
	selectedTargetReference: TTargetReference
	activeTargetReference: ITargetReference | null;
}

const mapStateToProps = (state: IRootState): IListenerFilterProps => ({
	settings: getInspectorSettings(state),
	selectedTargetReference: getSelectedTargetReference(state),		
	activeTargetReference: getActiveTargetReference(state),
});

interface IListenerFilterDispatch {
	setFilterEventsType(type: TFilterEvents): void
	setInclude(arr:string[]):void
	setExclude(arr: string[]): void
	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main", state: TState) => void
	onSetTargetReference: (arg: ITargetReference) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IListenerFilterDispatch, Record<string, unknown>> = (dispatch):IListenerFilterDispatch => ({
	setExclude: (arr) => dispatch(setExcludeAction(arr)),
	setFilterEventsType: (type) => dispatch(setFilterTypeAction(type)),
	setInclude: (arr) => dispatch(setIncludeAction(arr)),
	onSetFilter: (type, subType, state) => dispatch(setFilterStateAction(type, subType, state)),
	onSetTargetReference:(arg) => dispatch(setTargetReferenceAction(arg)),
});

export const ListenerFilterContainer = connect(mapStateToProps, mapDispatchToProps)(ListenerFilter);