// eslint-disable-next-line @typescript-eslint/no-var-requires
//const os = require("os");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const host = require("uxp").host;

export class ThemeManager{

	private static _bgColor = "";
	private static _fontFamily = "";
	private static _fontSize = "";
	private static _theme = "";
	private static _platform = "";

	public static get bgColor():string{
		return this._bgColor;
	}
	public static set bgColor(str:string){
		this._bgColor = str;
	}
	public static get fontFamily():string{
		return this._fontFamily;
	}
	public static set fontFamily(str:string){
		this._fontFamily = str;
	}
	public static get fontSize():string{
		return this._fontSize;
	}
	public static set fontSize(str:string){
		this._fontSize = str;
	}
	public static get theme():string{
		return this._theme;
	}
	public static set theme(str:string){
		this._theme = str;
	}
	public static get platform():string{
		return this._platform;
	}
	public static set platform(str:string){
		this._platform = str;
	}

	public static onThemeChanged = (event: any): void => {
		ThemeManager.updateOnThemeChange();
	}

	private static updateOnThemeChange = async () => {
		ThemeManager.theme = await host.getTheme();
		ThemeManager.platform = host.platform;
		const bgColor = await host.getBackgroundColor();
		ThemeManager.bgColor = bgColor.match(/#[0-9a-f]{6}/i)[0]; // wasn't valid JSON
		const { family: fontFamily, size: fontSize } = JSON.parse(await host.getFont());
		ThemeManager.fontFamily = fontFamily;
		ThemeManager.fontSize = fontSize;
		ThemeManager.updateBodyClass();
	}

	private static updateBodyClass = () => {
		const myClass = `${ThemeManager.theme}-theme ${ThemeManager.platform}-platform`;
		window.document.body.className = myClass; 
		console.log(myClass);
	}

	public static start():void {
		ThemeManager.updateOnThemeChange();
		host.addEventListener("themechanged", this.onThemeChanged);		
	}
	public static stop():void {
		host.removeEventListener("themechanged", this.onThemeChanged);		
	}
}