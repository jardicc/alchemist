import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { clearAction, clearViewAction, importItemsAction, importStateAction } from "../../actions/inspectorActions";
import { getDescriptorsListView, getAllDescriptors, getSelectedDescriptors } from "../../selectors/inspectorSelectors";
import React from "react";
import "./Footer.less";
import { ButtonMenu } from "../ButtonMenu/ButtonMenu";
import { TExportItems, TImportItems, IDescriptor } from "../../model/types";
import { Settings } from "../../classes/Settings";
import { GetInfo } from "../../classes/GetInfo";
import { filterNonExistent } from "../../classes/filterNonExistent";
import { Main } from "../../../shared/classes/Main";
import { Dispatch } from "redux";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const versions = require("uxp").versions;

class Footer extends React.Component<TFooter,Record<string,unknown>> { 
	constructor(props: TFooter) {
		super(props);
	}

	private exportState = () => {
		Settings.saveSettingsWithDialog(this.props.wholeState);
	}

	private exportItems = async (kind: TExportItems) => {		
		Settings.exportDescriptorItems(kind === "all" ? this.props.allItems : this.props.selectedItems);
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



	public render(): React.ReactNode{
		const { onClear, onClearView, allItems, onClearNonExistent } = this.props;
		const psVersionSegments = GetInfo.getBuildString()//.split(" ");
		//const psVersionString = psVersionSegments[0] + " " + psVersionSegments[1].replace("(","");
		return (
			<div className="Footer">
				{/*<div className="button" onClick={e=>location.reload()}>Reload</div>*/}
				<ButtonMenu
					key="clear"
					className="abc"
					placementVertical="top"
					placementHorizontal="right"
					items={
						<div className="column">
							<div className="button" onMouseDown={() => { onClear(); }}>All</div>
							<div className="button" onMouseDown={() => { onClearView(false); }}>In view</div>
							<div className="button" onMouseDown={() => { onClearView(true); }}>Not in view</div>
							<div className="button" onMouseDown={() => { onClearNonExistent(filterNonExistent(allItems));}}>Non-existent</div>
						</div>
					}>
					<div className="button">Clear...</div>
				</ButtonMenu>
				{
					//<div className="button">Group same</div>
				}
				<div className="spread"></div>
				<div className="versionBar">
					<span className="version">v. {versions.plugin} {Main.devMode ? "DEV":"PROD"}</span>
					<span> / </span>
					<span className="version">{versions.uxp}</span>
					<span> / PS: </span>
					<span className="version">{psVersionSegments}</span>
				</div>
				<div className="spread"></div>
				<div className="copy">Copyright © 2021 <a href="https://bereza.cz">Bereza.cz</a></div>
				<div className="spread"></div>
				<ButtonMenu
					key="import"
					className="abc"
					placementVertical="top"
					placementHorizontal="left"
					items={
						<div className="column">
							<div className="button" onMouseDown={this.importState}>App state</div>
							<div className="button" onMouseDown={() => this.importItems("append")}>Add items</div>
							<div className="button" onMouseDown={() => this.importItems("replace")}>Replace items</div>
						</div>
					}>
					<div className="button">Import...</div>
				</ButtonMenu>
				<ButtonMenu
					key="export"
					className="abc"
					placementVertical="top"
					placementHorizontal="left"
					items={
						<div className="column">
							<div className="button" onMouseDown={() => { this.exportState();}}>App state</div>
							<div className="button" onMouseDown={() => this.exportItems("all")}>All items</div>
							<div className="button" onMouseDown={() => this.exportItems("selected")}>Selected items</div>
						</div>
					}>
					<div className="button">Export...</div>
				</ButtonMenu>
			</div>
		);
	}
}


type TFooter = IFooterProps & IDispatcherDispatch

interface IFooterProps{
	wholeState: IRootState
	viewItems: IDescriptor[]
	allItems:IDescriptor[]
	selectedItems:IDescriptor[]
}

const mapStateToProps = (state: IRootState): IFooterProps => ({
	wholeState: state,
	viewItems: getDescriptorsListView(state),
	allItems: getAllDescriptors(state),
	selectedItems: getSelectedDescriptors(state),
});

interface IDispatcherDispatch {
	onClear: () => void
	onClearView: (keep: boolean) => void
	setWholeState: (state: IRootState) => void
	importItems: (items: IDescriptor[], kind: TImportItems) => void
	onClearNonExistent:(items: IDescriptor[])=>void
}

const mapDispatchToProps= (dispatch:Dispatch): IDispatcherDispatch => ({
	onClear: () => dispatch(clearAction()),
	onClearView: (keep) => dispatch(clearViewAction(keep)),
	importItems:(items,kind)=>dispatch(importItemsAction(items,kind)),
	setWholeState: (state) => dispatch(importStateAction(state)),
	onClearNonExistent:(items)=>dispatch(importItemsAction(items,"replace")),
});

export const FooterContainer = connect<IFooterProps, IDispatcherDispatch, Record<string,unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Footer);