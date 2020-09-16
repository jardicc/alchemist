import React from "react";
import "./Dispatcher.less";
import { Helpers } from "../../classes/Helpers";
import { ITargetReference, IDescriptor } from "../../model/types";


export interface IDispatcherProps{
	snippet:string
}

export interface IDispatcherDispatch {
	setDispatcherValue: (value: string) => void
	onAddDescriptor: (descriptor: IDescriptor) => void
}


type TDispatcher = IDispatcherProps & IDispatcherDispatch


export class Dispatcher extends React.Component<TDispatcher, any> {

	constructor(props: TDispatcher) {
		super(props);

		this.state = {};
	}

	private change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.setDispatcherValue(e.currentTarget.value);
	}

	private send = () => {
		try {

			const startTime = Date.now();
			const data:any = eval(this.props.snippet);
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
				originalData: data,
				originalReference,
				pinned: false,
				selected: false,
				renameMode: false,
				calculatedReference: data,
				title: "Dispatched"
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
				<textarea defaultValue={this.props.snippet} onChange={this.change} maxLength={Number.MAX_SAFE_INTEGER} />
				<div className="button" onClick={this.send}>Send</div>
			</div>
		);
	}
}