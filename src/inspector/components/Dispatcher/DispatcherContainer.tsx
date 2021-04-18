import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { setDispatcherValueAction, addDescriptorAction } from "../../actions/inspectorActions";
import { getDispatcherSnippet } from "../../selectors/dispatcherSelectors";
import { getInspectorSettings } from "../../selectors/inspectorSelectors";

/* eslint-disable quotes */
import React from "react";
import "./Dispatcher.less";
import { Helpers } from "../../classes/Helpers";
import { ITargetReference, IDescriptor, ISettings } from "../../model/types";
import { RawDataConverter } from "../../classes/RawDataConverter";
import { getInitialState } from "../../store/initialState";


export interface IDispatcherProps{
	snippet: string
	settings:ISettings
}

export interface IDispatcherDispatch {
	setDispatcherValue: (value: string) => void
	onAddDescriptor: (descriptor: IDescriptor) => void
}


type TDispatcher = IDispatcherProps & IDispatcherDispatch


class Dispatcher extends React.Component<TDispatcher, any> {

	constructor(props: TDispatcher) {
		super(props);

		this.state = {};
	}

	private change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.setDispatcherValue(e.currentTarget.value);
	}

	private send = () => {
		try {
			const snippet = this.props.snippet;
			const startTime = Date.now();			
			let data: any;
			try {
				data = (function () { return eval(snippet); })();
			} catch (e) {
				data = {error:e.stack};
			}
			const endTime = Date.now();

			const originalReference: ITargetReference = {
				type: "listener",
				data: [{
					subType: "listenerCategory",
					content: {
						filterBy: "off",
						value: "dispatch"
					}
				}]
			};

			const result: IDescriptor = {
				endTime,
				startTime,
				id: Helpers.uuidv4(),
				locked: false,
				originalData: RawDataConverter.replaceArrayBuffer(data),
				originalReference,
				pinned: false,
				selected: false,
				renameMode: false,
				calculatedReference: data,
				title: "Dispatched",
				descriptorSettings: this.props.settings.initialDescriptorSettings
			};

			//this.props.setLastHistoryID;
			this.props.onAddDescriptor(result);
		} catch (e) {
			console.error(e);
		}
	}


	public render(): JSX.Element {
		return (
			<div className="Dispatcher">				
				<div className="help">Content of variable or value itself at the last line will be recorded. Use <code>{`batchPlay([{_obj:"invert"}])`}</code> instead of <code>{`const result = batchPlay([{_obj:"invert"}])`}</code><br /></div>
				<div className="textareaWrap">
					<span className="placeholder">{this.props.snippet}</span>
					<textarea defaultValue={this.props.snippet} onChange={this.change} maxLength={Number.MAX_SAFE_INTEGER} placeholder={getInitialState().dispatcher.snippets[0].content} />
				</div>
				<div className="button" onClick={this.send}>Send</div>
			</div>
		);
	}
}

const mapStateToProps = (state: IRootState): IDispatcherProps => {
	return {
		snippet: getDispatcherSnippet(state),
		settings: getInspectorSettings(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IDispatcherDispatch, Record<string, unknown>> = (dispatch):IDispatcherDispatch => {
	return {
		setDispatcherValue: (value) => dispatch(setDispatcherValueAction(value)),
		onAddDescriptor: (desc) => dispatch(addDescriptorAction(desc)),
	};
};

export const DispatcherContainer = connect<IDispatcherProps, IDispatcherDispatch>(mapStateToProps, mapDispatchToProps)(Dispatcher);