import { IRootState } from "../../../shared/store";
import { MapDispatchToPropsFunction, connect } from "react-redux";
import { getInspectorSettings, getSelectedTargetReference, getActiveTargetReferenceListenerCategory, getActiveTargetReference } from "../../selectors/inspectorSelectors";
import { setExcludeAction, setFilterTypeAction, setIncludeAction, setFilterStateAction, setTargetReferenceAction } from "../../actions/inspectorActions";
import React from "react";
import { TSubTypes, ISettings, TFilterEvents, TTargetReference, ITargetReference, IContentWrapper, TListenerCategoryReference } from "../../model/types";
import { TBaseItems, baseItemsListener } from "../../model/properties";
import { TState, FilterButton } from "../FilterButton/FilterButton";
import cloneDeep from "lodash/cloneDeep";

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

	private onSetSubType = (subType: TSubTypes, value: React.ChangeEvent<HTMLSelectElement>) => {

		const { onSetTargetReference, activeTargetReference} = this.props;
		const found = cloneDeep(activeTargetReference);
		
		if (found) {
			const content = found?.data?.find(i => i.subType === subType)?.content;
			if (content) {
				content.value = value.target.value;
				onSetTargetReference(found);
			}
		}
	}

	private buildFilterRow = (
		label: string,
		subType: "listenerCategory",
		items: TBaseItems,
		content: {value:string|null|number,filterBy:TState},
	): React.ReactNode => {
		return (
			<div className="filter">
				<div className="label">{label}</div>
				<sp-dropdown quiet="true">
					<sp-menu slot="options" onClick={(e: React.ChangeEvent<HTMLSelectElement>) => this.onSetSubType("listenerCategory", e)}>
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


type TListenerFilter = IListenerFilterProps & IListenerFilterDispatch

interface IListenerFilterProps{
	settings: ISettings
	selectedTargetReference: TTargetReference
	activeTargetReferenceListenerCategory: IContentWrapper<TListenerCategoryReference>
	activeTargetReference: ITargetReference | null;
}

const mapStateToProps = (state: IRootState): IListenerFilterProps => ({
	settings: getInspectorSettings(state),
	selectedTargetReference: getSelectedTargetReference(state),		
	activeTargetReferenceListenerCategory: getActiveTargetReferenceListenerCategory(state) as IContentWrapper<TListenerCategoryReference>,
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