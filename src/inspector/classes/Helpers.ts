import photoshop,{core} from "photoshop";
import { ActionDescriptor } from "photoshop/dom/CoreModules";

export class Helpers{

	private static widthChecked = false;

	public static uuidCustom(): string {
		return "s_" + crypto.randomUUID().replaceAll("-", "");
	}

/*	public static getPanelWidth(panelID: string): number{
		Helpers.widthChecked = true;
		const width = window.document.body.querySelector(`[panelid=${panelID}]`)?.clientWidth ?? 0;
		console.log(width);
		if (width === 0) { return 400;}
		return width;
	}

	public static pxToPanelWidthPercentage(panelID: string, px: number): number {
		const w = this.getPanelWidth(panelID);
		return (px / w) * 100;
	}

	public static percToPanelWidthPx(panelID: string, perc: number): number{
		const px = perc / 100 * this.getPanelWidth(panelID);
		return px;
	}*/
}

export async function alert(message:string):Promise<void> {
	await photoshop.core.showAlert({ message});
}

export async function replayDescriptor(desc: ActionDescriptor): Promise<ActionDescriptor[] | null> {

	let res: ActionDescriptor[]=[];
	
	try {
		await core.executeAsModal(async () => {
			res = await photoshop.action.batchPlay([desc], {});
		}, {
			"commandName": "Alchemist Replay: " + desc._obj,
		});
		return res;
	}
	catch (e: any) {
		if (e.number === 9) {
			await photoshop.core.showAlert({ message: "executeAsModal was rejected (some other plugin is currently inside a modal scope)" });
		}
		throw new Error(e);
	}
}