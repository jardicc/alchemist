import { decode } from "iconv-lite";
import { Base64 } from "../../inspector/classes/Base64";
import { RawDataConverter } from "../../inspector/classes/RawDataConverter";
import { uxp } from "../../inspector/types/uxp";
import { charIDToStringID } from "./CharIDToStringID";
import { DataViewCustom } from "./DataViewCustom";
import { IActionSet, IActionItem, ICommand, IDescriptor, TDescDataType, TRefDataType, IObjectArrayListInner, IActionSetUUID } from "../types/model";
import { Helpers } from "../../inspector/classes/Helpers";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localFileSystem: uxp.storage.LocalFileSystemProvider = require("uxp").storage.localFileSystem;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const formats = require("uxp").storage.formats;

function addUUIDs(arg:IActionSet) :IActionSetUUID{
	const data: IActionSetUUID = arg as IActionSetUUID;
	data.__uuid__ = Helpers.uuidv4();

	data.actionItems.forEach(item => {
		item.__uuid__ = Helpers.uuidv4();
		item.commands.forEach(command =>
			command.__uuid__ = Helpers.uuidv4(),
		);
	});

	return data;
}

export async function doIt():Promise<IActionSetUUID> {
	const dataView = await loadFile();
	const parsed = addUUIDs(parse(dataView));
	//console.log(parsed);
	//const res = JSON.stringify(parsed, null, 3);

	return parsed;
}

export async function loadFile():Promise<DataView|null> {
	const file = await localFileSystem.getFileForOpening({
		types: ["atn"],
		allowMultiple: false,
		//initialLocation: await Settings.settingsFolder()
	});
	if (!file) {
		return null;
	}
	const data:ArrayBuffer = await file.read({format: formats.binary});
	try {
		const result = new DataView(data);
		return result;
	} catch (e) {
		console.log("Error - with reading of settings!");
		return null;
	}
}

export function parse(d: DataView):IActionSet {
	const res:Partial<IActionSet> = {};
	const data = new DataViewCustom(d.buffer, false);
	const version = data.getUint32();

	if (version !== 16) {
		throw new Error("ATN wrong version. Should be 16 but instead got: " + version);
	}

	res.version = version;
	res.actionSetName = data.getUtf16String();
	res.expanded = data.getBoolean();
	
	const actionsCount = data.getUint32();
	if (actionsCount) {
		res.actionItems = [];		
	}

	for (let i = 0; i < actionsCount; i++) {

		const item: Partial<IActionItem> = {
			fKeyIndex: data.getUint16(),
			shiftKey: data.getBoolean(),
			commandKey: data.getBoolean(),
			colorIndex: data.getUint16(),
			actionItemName: data.getUtf16String(),
			expanded: data.getBoolean(),
		};

		const commandsCount = data.getUint32();
		if (commandsCount) {
			item.commands = [];
		}


		for (let j = 0; j < commandsCount; j++) {
			let command: Partial<ICommand> = {
				expanded:data.getBoolean(),
				enabled:data.getBoolean(),
				showDialogs:data.getBoolean(),
				dialogMode:data.getUint8(),
			};

			const desc: IDescriptor = {
				_obj: data.getCommandStringID(),
			};

			command = {
				...command,
				commandName: data.readASCII(),
				descriptor: desc,				
			};

			const isDescriptorFollowing: boolean = data.getInt32() === -1;
			if (isDescriptorFollowing) {
				parseActionDescriptor(data, desc);
			}

			item.commands.push(command as ICommand);
		}

		res.actionItems.push(item as IActionItem);
		
	}


	return res as IActionSet;
}

export function parseDescriptor(data: DataViewCustom, desc: any): void{
	const version = data.getUint32();
	if (version !== 16) {
		throw new Error("ATN descriptor wrong version. Should be 16 but instead got: " + version);
	}
	parseActionDescriptor(data, desc);
}

export function parseActionDescriptor(data: DataViewCustom, desc: any): void {
	const fromClassID = data.getUtf16String();
	const objKey = data.getStringID();
	desc._obj = desc._obj || objKey;
	const count = data.getUint32();

	for (let i = 0; i < count; i++) {
		const propertyName: string = data.getStringID();
		dataTypeHub(data, desc, propertyName);		
	}
}

export function dataTypeHub(data: DataViewCustom, desc: any, propertyName: string ): void {
	// new Uint8Array(data.buffer)
	const dataTypeKey: TDescDataType = data.readASCII(undefined,4) as TDescDataType;
	
	switch (dataTypeKey) {
		
		// Descriptor
		case "GlbO":
		case "Objc": {
			const subDesc: IDescriptor = { _obj: null };
			parseActionDescriptor(data, subDesc);
			desc[propertyName] = subDesc;
			return;
		}
			
		// String
		case "TEXT":
			desc[propertyName] = data.getUtf16String();
			return;
		
		// UnitFloat
		case "UntF": {
			desc[propertyName] = {
				_unit: charIDToStringID[data.readASCII(undefined, 4)],
				_value: data.getFloat64(),
			};
			return;
		}
		
		// List
		case "VlLs": {
			const count = data.getUint32();
			const list: any[] = [];
			desc[propertyName] = list;

			for (let i = 0; i < count; i++) {
				// :-( try to improve this
				const item:{dummy:any} = {dummy:null};
				dataTypeHub(data, item,"dummy");				
				list.push(Array.isArray(item.dummy) ? item.dummy[0] : item.dummy);
			}

			return;
		}
		
		// Alias
		case "alis":
		case "Pth ":{
			data.offset += 4; // block length since next key till path property end
			data.offset += 4; // txtu key
			data.offset += 4; // block length
			const nameLen = data.getUint16(undefined, true); // filename length. Character length not bytes
			console.log(nameLen);
			data.offset += 1; // x00 prefix

			// filename as Unicode
			const end = (nameLen - 1) * 2 + data.offset;
			const sub = new Uint8Array(data.buffer.slice(data.offset, end));

			const decoded: string = decode(sub as any, "utf16be").replace(/\0/g, "");
			console.log(decoded);
			data.offset = end;

			// unicode terminator
			data.offset += 2;
			// byte pad
			data.offset += 1;
			desc[propertyName] = {
				_kind: "local",
				_path: decoded,
			};
			return;
		}
			
		// Boolean
		case "bool":
			desc[propertyName] = data.getBoolean();
			return;
		
		// LargeInteger
		case "comp":
			desc[propertyName] = data.getInt64();
			return;
		
		// Double
		case "doub":
			desc[propertyName] = data.getFloat64();
			return;
		
		// Enumerated
		case "enum":
			desc[propertyName] = {
				_enum: data.getStringID(),
				_value: data.getStringID(),
			};
			return;
		
		// Integer
		case "long":
			desc[propertyName] = data.getInt32();
			return;
		
		// reference
		case "obj ":{
			referenceTypeHub(data, desc, propertyName);
			return;
		}
		// Class
		case "type":
		case "GlbC": {
			const classID = data.getUtf16String();
			desc[propertyName] = {
				_class: data.getStringID(),
			};
			return;			
		}
			
		// RawData
		case "tdta": {
			const length = data.getUint32();

			desc[propertyName] = {
				_rawData: "base64",
				_data: Base64.btoa(					
					RawDataConverter.arrayBufferToString(
						data.buffer.slice(data.offset, data.offset + length),
					),
				),
			};
			return;
		}
		
		// Ancient List
		case "ObAr":{
			const length = data.getUint32();
			const name = data.getUtf16String();
			const classID = data.getStringID();
			const count = data.getUint32();

			const list:any = {
				_objList: classID,
			};
			desc[propertyName] = list;

			for (let i = 0; i < count; i++) {
				const key = data.getStringID();
				// broken since here
				const listType = data.readASCII(undefined, 4);
				const valuesList: number[] = [];
				let unit = "error";

				if (listType==="UnFl") {
					unit = charIDToStringID[data.readASCII(undefined, 4)];
					console.log(unit);
					const unitCount = data.getUint32();

					

					for (let j = 0; j < unitCount; j++) {
						const value = data.getFloat64();
						valuesList.push(value);						
					}
				} else {
					throw new Error(`Unkown data type "${listType}" in ObjectArray "ObAr`);
				}

				console.log(unit);
				list[key] = {
					_unit: unit,
					list:valuesList,
				} as IObjectArrayListInner;
			}

			return;
		}
		default: throw new Error(`Unrecognized data type key in descriptor ${dataTypeKey}`);
		
	}
}

export function referenceTypeHub(data: DataViewCustom, desc: any, propertyName: string): void {
	const count = data.getUint32();
	const ref: any[] = [];
	desc[propertyName] = ref;
	
	for (let i = 0; i < count; i++) {
		const refType: TRefDataType = data.readASCII(undefined, 4) as TRefDataType;

		const name = data.getUtf16String();
		const classID = data.getStringID();

		switch (refType) {

			// Property
			case "prop": {
				ref.push({
					_ref: classID,
					_property: data.getStringID(),
				});
				break;
			}
				
			// Class
			case "Clss": {
				ref.push({
					_ref: classID,
				});
				break;
			}
				
			// Enumerated Reference
			case "Enmr": {
				ref.push({
					_ref: classID,
					_enum: data.getStringID(),
					_value: data.getStringID(),
				});
				break;
			}
				
			// Offset
			case "rele": {
				ref.push({
					_ref: classID,
					_offset: data.getInt32(),
				});
				break;
			}
				
			// Identifier
			case "Idnt": {
				ref.push({
					_ref: classID,
					_id: data.getInt32(),
				});
				break;
			}
				
			// Index
			case "indx": {
				ref.push({
					_ref: classID,
					_index: data.getInt32(),
				});
				break;
			}
				
			// Name
			case "name": {
				ref.push({
					_ref: classID,
					_name: data.getUtf16String(),
				});
				break;
			}
				
			default: throw new Error(`Unrecognized data type key in reference ${refType}`);
		}
	}	
}
