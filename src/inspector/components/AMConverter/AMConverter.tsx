import React, { Component } from "react";
import { IAMCoverter, ISettings } from "../../model/types";
import "./AMConverter.less";
import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { getInspectorSettings } from "../../selectors/inspectorSelectors";
import { setConverterInfoAction, setMaximumItems, setRecordRawAction } from "../../actions/inspectorActions";
import { AMHackFileFactory } from "../../classes/AMHackFileFactory";

export interface IAMConverterProps{
	codeSnippet: string
	isFileInstalled:boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAMConverterDispatch {
	setConverterInfoAction: (value: Partial<IAMCoverter>) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISettingsState { }

export type TAMConverter = IAMConverterProps & IAMConverterDispatch

class AMConverter extends Component<TAMConverter, ISettingsState> {

	constructor(props: TAMConverter) {
		super(props);
	}

	public componentDidMount() {
		(async () => {
			const isPresetFileInstalled: boolean = await AMHackFileFactory.isPresetFileInstalled();
			const snippet: string = await AMHackFileFactory.getHackCode();
			this.props.setConverterInfoAction({
				isPresetFileInstalled,
				snippet,
			});
		})();
	}
	
	public render(): React.ReactNode {
		const {codeSnippet,isFileInstalled} = this.props;
		return (
			<div className="AMConverter">
				<div>
					<div>
						<h3>AM Converter</h3>
						<p>
							This tool will help you to convert Action Manager code from ExtendScript into UXP batchPlay. Once everything is set please click &quot;Listener&quot; button in &quot;Descriptors&quot; tab and action descriptors will appear here and in code tab you will see generated code.
						</p>
					</div>
					<div>
						<h3>Modify your ExtendScript</h3>
						<p>Please add this snippet at the top of your root ExtendScript file.</p>
						<textarea className="snippet" key={Date.now()} maxLength={Number.MAX_SAFE_INTEGER} value={codeSnippet} readOnly={true} />
						<span>
							Then prepend <pre>_</pre> and change <pre>executeAction</pre> into <pre>_executeAction</pre> and <pre>executeActionGet</pre> into <pre>_executeActionGet</pre> everywhere where you want to send action from ExtenScript into Alchemist.
						</span>
					</div>
					<div>
						<h3>Preset script file</h3>
						<p>
							<span>Status: </span><span className={(isFileInstalled?"isInstalled":"isNotInstalled")+" status"}>{isFileInstalled ? "File is installed" : "File is NOT installed"}</span>
						</p>
						
						<span>If script file is not installed please create this file: </span><pre>[rootFolderOfPhotoshop]/Presets/Scripts/Alchemist-Listener.jsx</pre>
						
						
					</div>
					<div>
						<span>Paste this content inside: </span>
						<textarea className="snippet higher" key={Date.now()} maxLength={Number.MAX_SAFE_INTEGER} value={AMHackFileFactory.presetScriptContent} readOnly={true} />
						<span>Save it and then restart Photoshop</span>
					</div>

				</div>
			</div>
		);
	}
}



const mapStateToProps = (state: IRootState): IAMConverterProps => {
	return {
		codeSnippet: state.inspector.amConvertor.snippet,
		isFileInstalled: state.inspector.amConvertor.isPresetFileInstalled,
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IAMConverterDispatch, Record<string, unknown>> = (dispatch):IAMConverterDispatch => {
	return {
		setConverterInfoAction: (value) => dispatch(setConverterInfoAction(value)),
	};
};

export const AMConverterContainer = connect<IAMConverterProps, IAMConverterDispatch>(mapStateToProps, mapDispatchToProps)(AMConverter);

