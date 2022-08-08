import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { getGeneratedCode } from "../../selectors/inspectorCodeSelectors";

import React, { Component } from "react";
import "./GeneratedCode.less";
import { Dispatch } from "redux";
import SP from "react-uxp-spectrum";

class GeneratedCode extends Component<TGeneratedCode, Record<string,unknown>> {

	constructor(props: TGeneratedCode) {
		super(props);

		this.state = {
		};
	}
	
	public render(): React.ReactNode {

		return (
			<div className="GeneratedCode">
				<SP.Textarea
					className="generatedCodeBox"
					value={this.props.code}
				/>
			</div>
		);
	}
}


type TGeneratedCode = IGeneratedCodeProps & IGeneratedCodeDispatch

interface IGeneratedCodeProps{
	code: string
}

const mapStateToProps = (state: IRootState): IGeneratedCodeProps => ({
	code: getGeneratedCode(state),
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IGeneratedCodeDispatch {
	
}

const mapDispatchToProps: MapDispatchToPropsFunction<IGeneratedCodeDispatch, Record<string, unknown>> = (dispatch: Dispatch): IGeneratedCodeDispatch => ({
});

export const GeneratedCodeContainer = connect<IGeneratedCodeProps, IGeneratedCodeDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(GeneratedCode);