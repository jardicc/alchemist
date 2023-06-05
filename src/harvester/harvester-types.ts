import {ActionDescriptor} from "photoshop/dom/CoreModules";
import {Harvester} from "./Harvester";
import {HarvesterFS} from "./HarvesterFS";

export interface IFileContent{
	[key:string]:ActionDescriptor
}

export interface IHarvestersList{
	[key:string]: HarvesterFS
}