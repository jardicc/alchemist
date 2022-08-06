import { connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import React from "react";
import "./Footer.less";
import { GetInfo } from "../../classes/GetInfo";
import { Main } from "../../../shared/classes/Main";
import {Dispatch} from "redux";
import {valid,coerce} from "semver";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const versions = require("uxp").versions;

class Footer extends React.Component<TFooter,Record<string,unknown>> { 
	constructor(props: TFooter) {
		super(props);
	}

	public render(): React.ReactNode{
		const psVersionSegments = GetInfo.getBuildString();
		const uxpVersion = valid(coerce(versions?.uxp?.split?.("-")?.[1])) ?? "Parser error";
		const psVersion = valid(coerce(psVersionSegments?.split?.(" ")?.[0])) ?? "Parser error";
		const buildParts = psVersionSegments?.split(" ")?.[1]?.split(".");
		const buildNumber = buildParts?.length >= 3 ? (buildParts[1] + buildParts[2]) : "";

		return (
			<div className="Footer">
				<div className="versionBar">
					<span className="version">{versions.plugin} {Main.devMode ? "DEV":"PROD"}</span>
					<span> / </span>
					<span className="version">UXP: {uxpVersion}</span>
					<span> / PS: </span>
					<span className="version">{psVersion} ({buildNumber})</span>
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