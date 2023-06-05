import {harvesterControl} from "./HarvesterControl";
import {events} from "../inspector/classes/StringIDs";
import {Harvester} from "./Harvester";

export class Harvest{
	constructor() { 
		//
	}
	
	public async getNewActions() {
		const files = await harvesterControl.listAllFiles();
		const actions = files.map(file => file.name.replace(".json", ""));
		const unique = actions.filter(action => !events.includes(action));
		console.log("Unique action names");
		console.log(unique);
	}

	public async getAllEnums() {
		const files = await harvesterControl.listAllFiles();
		const actions = files.map(file => file.name.replace(".json", ""));
		const list = actions.map(action => new Harvester(action, harvesterControl));
		// eslint-disable-next-line require-await
		const promises = list.map(async item => item.loadStack());
		await Promise.all(promises);
		const collected:any = {};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, require-await
		const promisesRec = list.map(async h => await h.recursion(async (property, value, data, output) => {
			if (property === "_enum") {
				collected[value] = collected[value] ?? [];
				if (!collected[value].includes(data._value)) {
					collected[value].push(data._value);					
				}
			}
		}), collected);
		await Promise.all(promisesRec);
		console.log(collected);
	}
}

export const harvest = new Harvest();