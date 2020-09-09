import React from "react";
import "./Footer.less";
import { ButtonMenu } from "../ButtonMenu/ButtonMenu";
import { TExportItems, TImportItems, IDescriptor } from "../../model/types";
import { IRootState } from "../../../shared/store";
import { Settings } from "../../classes/Settings";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const manifest = require("./../../../../uxp/manifest.json");

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IFooterProps{
	wholeState: IRootState
	viewItems: IDescriptor[]
	allItems:IDescriptor[]
}

export interface IFooterDispatch {
	onClear: () => void
	onClearView: (keep: boolean) => void
	setWholeState: (state: IRootState) => void
	importItems: (items: IDescriptor[], kind: TImportItems) => void
}


export type TFooter = IFooterProps & IFooterDispatch
export type TFooterComponent = React.Component<TFooter>

export class Footer extends React.Component<TFooter> { 
	constructor(props: TFooter) {
		super(props);
	}

	private exportState = () => {
		Settings.saveSettingsWithDialog(this.props.wholeState);
	}

	private exportItems = async (kind:TExportItems) => {
		console.log("export");
	}


	private importState = async () => {
		const data = await Settings.importStateWithDialog();
		if(!data){return;}
		this.props.setWholeState(data);
	}
	
	private importItems = async (kind:TImportItems) => {
		const data = await Settings.importStateWithDialog();
		if(!data){return;}
		this.props.importItems(data,kind);
	}



	public render():React.ReactNode{
		return (
			<div className="Footer">
				<div className="button" onClick={e=>location.reload()}>Reload</div>
				<ButtonMenu
					key="clear"
					className="abc"
					placement={"top"}
					items={
						<div className="column">
							<div className="button" onClick={() => this.props.onClear()}>All</div>
							<div className="button" onClick={() => this.props.onClearView(false)}>In view</div>
							<div className="button" onClick={() => this.props.onClearView(true)}>Not in view</div>
							<div className="button">Non-existent</div>
						</div>
					}>
					<div className="button">Clear...</div>
				</ButtonMenu>
				<div className="button">Group same</div>
				<div className="spread"></div>
				<div>
					<span className="version">v. {manifest.version}</span>
				</div>
				<div className="spread"></div>
				<ButtonMenu
					key="import"
					className="abc"
					placement={"top"}
					items={
						<div className="column">
							<div className="button" onClick={this.importState}>App state</div>
							<div className="button" onClick={() => this.importItems("append")}>Add items</div>
							<div className="button" onClick={() => this.importItems("replace")}>Replace items</div>
						</div>
					}>
					<div className="button">Import...</div>
				</ButtonMenu>
				<ButtonMenu
					key="export"
					className="abc"
					placement={"top"}
					items={
						<div className="column">
							<div className="button" onClick={() => {this.exportState();}}>App state</div>
							<div className="button" onClick={() => this.exportItems("all")}>All items</div>
							<div className="button" onClick={() => this.exportItems("selected")}>Selected items</div>
						</div>
					}>
					<div className="button">Export...</div>
				</ButtonMenu>
			</div>
		);
	}
}