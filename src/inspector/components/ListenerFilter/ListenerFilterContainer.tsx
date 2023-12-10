import {IRootState} from "../../../shared/store";
import {MapDispatchToPropsFunction, connect} from "react-redux";
import {getListenerNotifierFilterSettings} from "../../selectors/inspectorSelectors";
import {setListenerNotifierFilterAction} from "../../actions/inspectorActions";
import React from "react";
import {IListenerNotifierFilter} from "../../model/types";
import SP from "react-uxp-spectrum";

class ListenerFilter extends React.Component<TListenerFilter, Record<string, unknown>> {
	constructor(props: TListenerFilter) {
		super(props);
	}

	private setExclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onSetNotifierListenerFilter({
			exclude: e.currentTarget.value.split(";"),
		});
	};

	private setInclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onSetNotifierListenerFilter({
			include: e.currentTarget.value.split(";"),
		});
	};

	private onSetFilterEventsType = (e: any) => {
		this.props.onSetNotifierListenerFilter({
			type: e.target.value,
		});
	};

	private renderFilterFields = (): JSX.Element | null => {
		const {exclude, include, type} = this.props.settings;
		switch (type) {
			case "exclude": {
				return (
					<>
						<div className="label">Exclude: </div><SP.Textfield onInput={this.setExclude as any} value={exclude.join(";")} className="input" quiet />
					</>
				);
			}
			case "include": {
				return (
					<>
						<div className="label">Include: </div><SP.Textfield onInput={this.setInclude as any} value={include.join(";")} className="input" quiet />
					</>
				);
			}
		}
		return null;
	};

	public render(): JSX.Element {
		const {type} = this.props.settings;
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
										selected={type === item.value ? true : undefined}
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

interface IListenerFilterProps {
	settings: IListenerNotifierFilter
}

const mapStateToProps = (state: IRootState): IListenerFilterProps => ({
	settings: getListenerNotifierFilterSettings(state),
});

interface IListenerFilterDispatch {
	onSetNotifierListenerFilter: (arg: Partial<IListenerNotifierFilter>) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IListenerFilterDispatch, Record<string, unknown>> = (dispatch): IListenerFilterDispatch => ({
	onSetNotifierListenerFilter: (arg) => dispatch(setListenerNotifierFilterAction(arg)),
});

export const ListenerFilterContainer = connect(mapStateToProps, mapDispatchToProps)(ListenerFilter);