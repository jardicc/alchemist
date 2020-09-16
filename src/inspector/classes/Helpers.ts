import photoshop from "photoshop";

export class Helpers{
	public static uuidv4():string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}

export async function alert(message:string):Promise<void> {
	await photoshop.core.showAlert({ message});
}