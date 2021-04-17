import type { uxp } from "../types/uxp";
import photoshop from "photoshop";
import { alert } from "./Helpers";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localFileSystem:uxp.storage.LocalFileSystemProvider = require("uxp").storage.localFileSystem;

export class AMHackFileFactory {

	private static readonly includeHackFileName = "alchemist-AM-Hack.jsx";
	private static readonly presetScriptHackFileName = "alchemist-AM-Hack.jsx";

	private static readonly hackContent = `
	$.global._executeAction = function(typeID, descriptor, dialogModes) {
		var wrapperDesc = new ActionDescriptor();
		// descriptor can be undefined so we need to add empty descriptor for compatibility
		descriptor = descriptor || new ActionDescriptor();
		// alchemist will pick only nested descriptor with specific name
		wrapperDesc.putObject(stringIDToTypeID("_alchemistAMHack"), typeID, descriptor);
		// scripts can be recordable in action panel
		// recordable script must be loaded along with PS start so it has to be prepared in presets folder so make sure that it is there
		// then we can send in any descriptor we want to
		// uxp listener can record invocation of custom scripts same as action panel can do
		// so Alchemist will listen to this UUID and record it!
		executeAction(stringIDToTypeID("17d1f0b1-653d-11e0-ae3e-0800200c9a66"), wrapperDesc, DialogModes.NO);
		// execute action and return result
		return executeAction(typeID, descriptor, dialogModes);
	}
	
	$.global._executeActionGet = function(reference) {
		// executeActionGet more performant shortcut for executeAction with "get" event so we will transform it
		// make new descriptor
		var descGet = new ActionDescriptor();
		// put reference inside
		descGet.putReference(stringIDToTypeID("null"), reference);
		// now it is same action as anything else
		return _executeAction(stringIDToTypeID("get"), descGet, DialogModes.NO);
	}
	`;

	public static readonly presetScriptContent =
`/*
// BEGIN__HARVEST_EXCEPTION_ZSTRING
<javascriptresource>
	<name>Alchemist Dummy Hack</name>
	<eventid>17d1f0b1-653d-11e0-ae3e-0800200c9a66</eventid>
	<category>zAlchemist</category>
</javascriptresource>
// END__HARVEST_EXCEPTION_ZSTRING
*/

app.playbackParameters;
app.playbackDisplayDialogs;`;

	public static async reset() {
		try {
			const folder = await AMHackFileFactory.settingsFolder();
			const entry = await folder.getEntry(AMHackFileFactory.includeHackFileName);
		
			if (!entry.isFile) {
				return;
			}
			await entry.delete();
		} catch (e) {
			console.error("Error - settings reset failed!");
		}
	}

	public static async getHackCode(): Promise<string> {
		const folder = await AMHackFileFactory.settingsFolder();
		const entry = await folder.getEntry(AMHackFileFactory.includeHackFileName);
		const path: string = entry.nativePath.replace(/\\/gm, "\\\\");
		const code = `$.evalFile("${path}");`;
		console.log("hack code", code);
		return code;
	}

	public static async settingsFolder(): Promise<uxp.storage.Folder> {
		const folder = await localFileSystem.getDataFolder();
		return folder;
	}

	public static async createFileToInclude(): Promise<void> {
		const folder = await AMHackFileFactory.settingsFolder();
		console.log(folder);
		const created = await folder.createFile(AMHackFileFactory.includeHackFileName, {
			overwrite: true
		});
		await created.write(AMHackFileFactory.hackContent, {
			append: false
		});
		console.log("saved");
	}

	public static async createFileInPresets(): Promise<void> {
		const folder = await AMHackFileFactory.pickScriptsPresetsFolder();
		if (!folder) {
			return;
		}
		console.log(folder);
		const created = await folder.createFile(AMHackFileFactory.presetScriptHackFileName, { overwrite: true });
		await created.write(AMHackFileFactory.presetScriptContent, { append: false });
		console.log("saved");
	}

	public static async pickScriptsPresetsFolder(): Promise<void | uxp.storage.Folder> {
		const scriptsFolder = await localFileSystem.getFolder();
		const isValid = (new RegExp(/Presets(\\|\/)Scripts(\\|\/?)$/i).test(scriptsFolder.nativePath));
		if (isValid) {
			return scriptsFolder;
		}
		await alert("This location is not valid");
		return;
	}

	public static async isPresetFileInstalled():Promise<boolean> {
		// this will run dummy script
		const result = await photoshop.action.batchPlay([{ _obj: "17d1f0b1-653d-11e0-ae3e-0800200c9a66" }], {});
		if (!result || result?.[0] === null) {
			return false;
		}
		// if it returns any property in object e.g. error message then it is not preset script
		return Object.keys(result?.[0]).length === 0;
	}
}