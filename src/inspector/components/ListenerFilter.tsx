import {useAppDispatch, useAppSelector} from "../../shared/store";
import {getListenerNotifierFilterSettings} from "../selectors/inspectorSelectors";
import {inspectorSlice} from "../inspectorSlice";
import React from "react";
import {IListenerNotifierFilter} from "../model/types";
import SP from "react-uxp-spectrum";

const {setListenerNotifierFilter} = inspectorSlice.actions;

export const ListenerFilter: React.FC = () => {
	const dispatch = useAppDispatch();
	const settings = useAppSelector(getListenerNotifierFilterSettings);
	const onSetNotifierListenerFilter = (arg: Partial<IListenerNotifierFilter>) => dispatch(setListenerNotifierFilter(arg));

	const setExclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		onSetNotifierListenerFilter({
			exclude: e.currentTarget.value.split(";"),
		});
	};

	const setInclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		onSetNotifierListenerFilter({
			include: e.currentTarget.value.split(";"),
		});
	};

	const onSetFilterEventsType = (e: any) => {
		onSetNotifierListenerFilter({
			type: e.target.value,
		});
	};

	const renderFilterFields = (): JSX.Element | null => {
		const {exclude, include, type} = settings;
		switch (type) {
			case "exclude": {
				return (
					<>
						<div className="label">Exclude: </div><SP.Textfield onInput={setExclude as any} value={exclude.join(";")} className="input" quiet />
					</>
				);
			}
			case "include": {
				return (
					<>
						<div className="label">Include: </div><SP.Textfield onInput={setInclude as any} value={include.join(";")} className="input" quiet />
					</>
				);
			}
		}
		return null;
	};

	const {type} = settings;
	return (
		<>
			<div className="filter excludeIncludeDropdownRow">
				<div className="label">Filter:</div>
				<SP.Dropdown quiet={true}>
					<SP.Menu slot="options" onChange={onSetFilterEventsType}>
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
				{renderFilterFields()}
			</div>
		</>
	);
};
