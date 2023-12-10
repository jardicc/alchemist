import {connect} from "react-redux";
import {IRootState} from "../../../shared/store";
import React from "react";
import "./Footer.less";
import {GetInfo} from "../../classes/GetInfo";
import {Main} from "../../../shared/classes/Main";
import {Dispatch} from "redux";
import {valid, coerce} from "semver";
import {versions} from "uxp";

class Footer extends React.Component<TFooter, Record<string, unknown>> {
	constructor(props: TFooter) {
		super(props);
	}

	public override render(): React.ReactNode {
		const psVersionSegments = GetInfo.getBuildString();
		const uxpVersion = valid(coerce(versions?.uxp?.split?.("-")?.[1])) ?? "Parser error";
		const psVersion = valid(coerce(psVersionSegments?.split?.(" ")?.[0])) ?? "Parser error";
		const buildParts = psVersionSegments?.split(" ")?.[1]?.split(".");
		const buildNumber = buildParts?.length >= 3 ? (buildParts[1] + buildParts[2]) : "";

		let mode = "PROD";
		if (Main.devMode) {
			mode = "DEV";
		}
		if (Main.isFirstParty) {
			mode = "⚡";
		}
		if (Main.privileged) {
			mode += " 💥";
		}

		return (
			<div className="Footer">
				<div className="versionBar">
					<span className="version"><a href="https://github.com/jardicc/alchemist/releases">{versions.plugin} {mode}</a></span>
					<span> / </span>
					<span className="version"><a href="https://developer.adobe.com/photoshop/uxp/2022/ps_reference/changelog/">PS: {psVersion}</a> ({buildNumber})</span>
					<span> / </span>
					<span className="version">UXP: {uxpVersion}</span>
				</div>
				<div className="spread"></div>
				<div className="copy">Copyright © {new Date().getFullYear()} <a href="https://bereza.cz">Bereza.cz</a></div>
			</div>
		);
	}
}


type TFooter = IFooterProps & IDispatcherDispatch & IOwnProps

interface IFooterProps {
}

interface IOwnProps {
	parentPanel: "inspector" | "atnConverter"
}

const mapStateToProps = (state: IRootState, ownProps: IOwnProps): IFooterProps => ({
});

interface IDispatcherDispatch {
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatcherDispatch => ({
});

export const FooterContainer = connect(mapStateToProps, mapDispatchToProps)(Footer);