import { uxp } from "../../inspector/types/uxp";
import { rootStore,IRootState} from "../../shared/store"
import { generateScriptFileCode, getManifestCode, getManifestGeneric } from "../sorSelectors";

//const fs = require("storage");
const fs:uxp.storage.LocalFileSystemProvider = require("uxp").storage.localFileSystem;

export class SorcererBuilder{
	constructor() {
		
	}

	public static async buildPlugin() {
		
		const state: IRootState = rootStore.getState()
		
		const pluginName = getManifestGeneric(state).name;
		const manifestContent = getManifestCode(state);

		const folder = await fs.getFolder();
		const targetFolder = await folder.createFolder(pluginName);

		const manifestFile = await targetFolder.createFile("manifest.json", { overwrite: true });
		await manifestFile.write(manifestContent, { append: false, format: require("uxp").storage.formats.utf8 });

		const indexFile = await targetFolder.createFile("index.html", { overwrite: true });
		await indexFile.write(SorcererBuilder.indexContent, { append: false, format: require("uxp").storage.formats.utf8 });

		const scriptFile = await targetFolder.createFile("index.js", { overwrite: true });
		await scriptFile.write(generateScriptFileCode(state), { append: false, format: require("uxp").storage.formats.utf8 });

		debugger;
	}

	private static indexContent =
`
<html>
<head>
	<script src="index.js"></script>    
	<style>
		body {
			color: white;
			padding: 0 16px;
		}
		li:before {
			content: '• ';
			width: 3em;
		}

		#layers {
			border: 1px solid #808080;
			border-radius: 4px;
			padding: 16px;
		}
	</style>
</head>
<body>

</body>
</html>
`
}