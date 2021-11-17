export interface ISorcererState {
	manifestInfo: IManifestInfo
	selectedItem: {
		kind: "command" | "panel" | "general" | "snippet"
		uuid: string | null
		
	}
	general: {
		
	}
	snippets:{
		list: ISnippet[]

	}
}

export interface ISnippet{
	type: "snippet"
	label:{default: string}
	author: string
	version: string
	code: string
	$$$uuid: string
	
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
	domains: "all"|string[];
}

export interface IRequiredPermissions {
	clipboard?:  "read" | "readAndWrite"
	launchProcess?: "any" | "none" | "request"
	allowCodeGenerationFromStrings?: boolean
	fonts?: "readInstalled"
	localFileSystem?:
		"plugin" /* plugin data only */
		| "request" /* request for external files */
		| "fullAccess" /* full access w/ no request */
	network?: INetwork
	webview?: IWebview
	ipc?:IIPC
}

export interface IIPC{
	enableHostCommunication?: true,
	enablePluginCommunication?: true
}

export interface IWebview{
	allow: "yes",
	domains: "all" | string[]
	allowLocalRendering: "yes" /* enable local files */
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
	$$$uuid:string
	$$$snippetUUIDs:string[]
}

export interface IEntrypointCommand {
	type: "command";
	id: string;
	label: ILabel;
	$$$uuid:string
	$$$snippetUUID:string|null
}

export interface IIcon {
	width: number;
	height: number;
	path: string;
	scale: number[];
	theme: ("darkest" | "dark" | "medium" | "light" | "lightest")[];
	species?: string[];
}


//		# Manifest V5 Permissions
//		Manifest V5 Supports the following permissions in the root-level `requiredPermissions` field. This field is a map of keys and their associated values; it is not an array.
//		
//		"requiredPermissions": {
//		    ...
//		}
//		
//		## Clipboard Access
//		Access to the clipboard is disabled by default. To enable the clipboard APIs and read or write to the clipboard, use the following permission in your manifest:
//		
//		"requiredPermissions": {
//		    "clipboard": "read" | "readAndWrite"
//		}
//		
//		> Note: A `write`-only permission will be coming in V6.
//		
//		## Networking
//		Access to the network must be explicitly declared in the manifest and is disabled by default.
//		
//		"requiredPermissions": {
//		    "network": {
//		        "domains": "all" /* access to all domains */
//		                 | ["example.com", "myplugin.com"] /* specific domains */
//		    }
//		}
//		
//		## Local File System
//		The level of access your plugin needs to the local file system must be defined in the manifest. By default, the plugin has access to its own data (`plugin`).
//		
//		"requiredPermissions": {
//		    "localFileSystem": "plugin" /* plugin data only */
//		                     | "request" /* request for external files */
//		                     | "fullAccess" /* full access w/ no request */
//		}
//		
//		## Webview
//		Access to webivews must be declared in the manifest (_currently disabled_).
//		
//		"requiredPermissions": {
//		    "webview": {
//		        "allow": "yes",
//		        "domains": "all" | [ "example.com" ]
//		        "allowLocalRendering": "yes" /* enable local files */
//		    }
//		}
//		
//		## Launching processes
//		In order to have the ability to launch external processes, you must declare the capability in your manifest. The default is `none`. Use of `any` is prohibited in marketplace-distributed plugins.
//		
//		"requiredPermissions": {
//		    "launchProcess": "any" | "none" | "request"
//		}
//		
//		## Viewing Font Information
//		_Not currently enabled_
//		Default is not to view any font information.
//		
//		"requiredPermissions": {
//		    "fonts": "readInstalled"
//		}
//		
//		## IPC Permissions
//		
//		"requiredPermissions": {
//		    "ipc": {
//		        "enableHostCommunication": true,
//		        "enablePluginCommunication": true
//		    }
//		}
//		
//		## Enable "eval"
//		Disabled by default and prohibited for plugins distributed in the plugin marketplace.
//		
//		"requiredPermissions": {
//		    "allowCodeGenerationFromStrings": true
//		}
//		
//		# Manifest V5 Feature Flags
//		Feature flags can be specified in the `featureFlags` root-level dictionary.
//		
//		"featureFlags": {
//		    "SpectrumVersion": string,
//		    "experimentalTableV1Support": true | false,
//		    "allowFocusOnClickForPanels": true | false
//		    "stopTabKeyDownToJsOnDefaultAction": true | false
//		}
//		
//		For panels, a special feature flag is also available that controls access to webviews. _Currently disabled_.
//		
//		"entrypoints": [
//		    {
//		        "id": "yourPanel",
//		        "type": "panel",
//		        "featureFlags": {
//		            "allowWebView": true
//		        }
//		    }
//		]
