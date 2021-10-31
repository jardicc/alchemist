import "./SnippetContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import PS from "photoshop";
import { TSelectedItem, TSelectActionOperation } from "../../../atnDecoder/atnModel";
import { setSelectActionAction } from "../../sorActions";
import { ISnippet } from "../../sorModel";
import { getActiveSnippet } from "../../sorSelectors";

export class Snippet extends React.Component<TSnippetContainer, ISnippetContainerState> { 
	constructor(props: TSnippetContainer) {
		super(props);
	}

	public render():React.ReactNode {
		const { activeSnippet } = this.props;
		
		if (activeSnippet === null) { return null;}

		return (
			<div className="SnippetContainerContainer">
				<h3>Snippet</h3>
				<div className="row">
					Snippet name: <SP.Textfield value={activeSnippet.name}  />
				</div>
				<div className="row">
					Version: <SP.Textfield value={activeSnippet.version}  />
				</div>
				<div className="row">
					Author: <SP.Textfield value={activeSnippet.author}  />
				</div>
				<div className="row">
					Code: <SP.Textarea value={activeSnippet.code}  />
				</div>
			</div>
		);
	}
}

type TSnippetContainer = ISnippetContainerProps & ISnippetContainerDispatch

interface ISnippetContainerState{

}

interface IOwn{
	
}

interface ISnippetContainerProps{
	activeSnippet:ISnippet
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): ISnippetContainerProps => (state = state as IRootState,{
	activeSnippet: getActiveSnippet(state),
});

interface ISnippetContainerDispatch {
	setSelectedItem(uuid:TSelectedItem,operation:TSelectActionOperation): void
}

const mapDispatchToProps = (dispatch:Dispatch):ISnippetContainerDispatch => ({
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
});

export const SnippetContainer = connect<ISnippetContainerProps, ISnippetContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(Snippet);