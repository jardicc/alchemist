import { connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import React from "react";
import "./Footer.less";
import { GetInfo } from "../../classes/GetInfo";
import { Main } from "../../../shared/classes/Main";
import { Dispatch } from "redux";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const versions = require("uxp").versions;

class Footer extends React.Component<TFooter,Record<string,unknown>> { 
	constructor(props: TFooter) {
		super(props);
	}

	public render(): React.ReactNode{
		const { parentPanel } = this.props;
		const psVersionSegments = GetInfo.getBuildString();
		return (
			<div className="Footer">
				<div className="versionBar">
					<span className="version">{versions.plugin} {Main.devMode ? "DEV":"PROD"}</span>
					<span> / </span>
					<span className="version">{versions.uxp}</span>
					<span> / PS: </span>
					<span className="version">{psVersionSegments}</span>
				</div>
				<div className="spread"></div>
				<div className="copy">Copyright © {new Date().getFullYear()} <a href="https://bereza.cz">Bereza.cz</a></div>
			</div>
		);
	}
}


type TFooter = IFooterProps & IDispatcherDispatch & IOwnProps

interface IFooterProps{
}

interface IOwnProps{
	parentPanel: "inspector" | "atnConverter"
}

const mapStateToProps = (state: IRootState, ownProps: IOwnProps): IFooterProps => ({
});

interface IDispatcherDispatch {
}

const mapDispatchToProps= (dispatch:Dispatch): IDispatcherDispatch => ({
});

export const FooterContainer = connect(mapStateToProps, mapDispatchToProps)(Footer);