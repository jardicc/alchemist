import photoshop from "photoshop";

export class Helpers{

	private static widthChecked = false;

	public static uuidv4():string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
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