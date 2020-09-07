/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import "./ButtonMenu.less";
import { Helpers } from "../../classes/Helpers";

export interface IItem{
	key: string
	title: React.ReactNode
}

export type TPlacement = "top" | "right" | "bottom" | "left";

export interface IButtonMenuProps{
	className:string
	//onChange: (id: string) => void
	items: React.ReactNode
	placement:TPlacement
	children: JSX.Element
}

export interface IButtonMenuDispatch {
	
}

interface IButtonMenuState{
	expanded: boolean
	uuid: string
	listHeight: number
	listWidth: number
	contentWidth:number
	contentHeight:number
}

export type TButtonMenu = IButtonMenuProps & IButtonMenuDispatch

export class ButtonMenu extends React.Component<TButtonMenu, IButtonMenuState> { 
	constructor(props: TButtonMenu) {
		super(props);

		this.state = {
			expanded: false,
			uuid: Helpers.uuidv4(),
			listHeight: 0,
			listWidth: 0,
			contentWidth:0,
			contentHeight:0,
		};
	}

	private listElement= ()=> {
		return document.getElementById(this.state.uuid)?.querySelector(".list");
	}

	private panelElement=()=> {
		const list = this.listElement();
		if (list) {
			return document.body.querySelector("[panelid=inspector]") ?? document.body;			
		}
		return null;
	}

	private listBox=()=> {
		const result =  this.listElement()?.getBoundingClientRect();
		return result;
	}

	private panelBox=()=> {
		return this.panelElement()?.getBoundingClientRect();
	}

	public componentDidMount(): void{
		const elList = this.listElement;
		const elContent = document.getElementById(this.state.uuid)?.querySelector(".childWrap");

		this.setState({
			...this.state,
			listHeight: elList()?.clientHeight ?? 0,
			listWidth: elList()?.clientWidth ?? 0,
			contentHeight:elContent?.clientHeight ?? 0,
			contentWidth:elContent?.clientWidth ?? 0,
		});
	}

	public componentDidUpdate(prevProps: TButtonMenu, prevState: IButtonMenuState): void {
		const el = this.listElement();
		
		const height = el?.clientHeight;
		const width = el?.clientWidth;

		if (height && height !== this.state.listHeight) {
			this.setState({
				...this.state,
				listHeight: height
			});
		}

		if (width && width !== this.state.listWidth) {
			this.setState({
				...this.state,
				listWidth: width
			});
		}
	}

	private generatePosition = () => {
		let result: React.CSSProperties = {};
		
		const { placement} = this.props;

		switch (placement) {
			case "bottom": result = {
				bottom: `-${this.state.listHeight}px`
			};
				break;
			case "left": result = {
				left: `-${this.state.listWidth}px`,
				top: "0px"
			};
				break;
			case "right": result = {
				top: "0px",
				right: `-${this.state.listWidth}px`
			};
				break;
			case "top": result = {
				top: `-${this.state.listHeight}px`,
			};
				break;
		}

		if (placement === "top" || placement === "bottom") {
			if ((this.listBox()?.right ?? Infinity) > (this.panelBox()?.right ?? -Infinity)) {
				result.right = "0px";
			} else {
				result.left = "0px";
			}
		}

		return result;
	}

	private renderList = () => {
		const { items,placement } = this.props;
		return (
			<div
				className={"list"}
				onClick={this.toggle}
				style={{ ...this.generatePosition(), visibility: (this.state.expanded ? "visible" : "hidden") }}
			>
				{items}
			</div>
		);
	}

	private hide = () => {
		console.log("blur");
		setTimeout(() => {
			this.setState({
				...this.state,
				expanded: false
			});
		},100);
	}

	private toggle = (): void => {
		console.log("Toggle button menu",this.state.expanded);
		this.setState({
			...this.state,
			expanded: !this.state.expanded
		});
	}


	public render(): JSX.Element {
		const { children} = this.props;
		
		return (
			<div id={this.state.uuid} className={"ButtonMenu" + " " + (this.props.className || "")}>
				<div
					className="childWrap"
					onClick={this.toggle}
					tabIndex={1}
					onBlur={this.hide}
				>
					{children}					
				</div>
				{this.renderList()}
			</div>
		);
	}
}