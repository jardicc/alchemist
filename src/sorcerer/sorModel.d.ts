export interface ISorcererState {
	manifestInfo: IManifestInfo
	selectedEntrypoint:number
}

export interface IManifestInfo{
	manifestVersion: 4 | 5;
	/** Name of your plugin */
	name: string;
	/** YOUR_ID_HERE */
	id: string;
	/** index.html */
	main: string;
	/** 1.0.0  */
	version: string;
	/** supported applications */
	host: IHost[];
	requiredPermissions: IRequiredPermissions;
	entrypoints: (IEntrypointPanel|IEntrypointCommand)[];
	icons: IIcon[];
}

export interface IData {
	apiVersion: 2;
}

export interface IHost {
	app: "XD"|"PS";
	minVersion: string;
	data: IData;
}

export interface INetwork {
	domains: string[];
}

export interface IRequiredPermissions {
	clipboard: string;
	launchProcess: string;
	allowCodeGenerationFromStrings: boolean;
	localFileSystem: string;
	network: INetwork;
}

export interface ILabel {
	default: string;
}

export interface ISize {
	width: number;
	height: number;
}

export interface IEntrypointPanel {
	type: "panel";
	id: string;
	label: ILabel;
	minimumSize: ISize;
	maximumSize: ISize;
	preferredDockedSize: ISize;
	preferredFloatingSize: ISize;
	icons: IIcon[];
}

export interface IEntrypointCommand {
	type: "command";
	id: string;
	label: ILabel;
}

export interface IIcon {
	width: number;
	height: number;
	path: string;
	scale: number[];
	theme: ("darkest" | "dark" | "medium" | "light" | "lightest")[];
	species?: string[];
}