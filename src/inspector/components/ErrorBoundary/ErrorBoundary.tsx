import React from "react";
import { Settings } from "../../classes/Settings";

interface IState{
	hasError: boolean,
	error:any
}

export class ErrorBoundary extends React.Component<any, IState> {
	constructor(props:any) {
		super(props);
		this.state = {
			hasError: false,
			error:null,
		};
	}
    
	static getDerivedStateFromError(error:any) {
		// Update state so the next render will show the fallback UI.
		console.log(error);
		return {
			hasError: true,
			error: error,
		};
	}
    
	componentDidCatch(error:any, errorInfo:any) {
		// You can also log the error to an error reporting service
		//logErrorToMyService(error, errorInfo);
	}
    
	public render() {
		if (this.state.hasError) {

			const style: React.CSSProperties = {
				backgroundColor: "#aa0000",
				color: "white",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
			};

			const whiteColor: React.CSSProperties = {
				color: "white",
				textDecoration:"underline",
			};

			const stack: React.CSSProperties = {
				// eslint-disable-next-line quotes
				fontFamily: `"Courier New", Courier,"Lucida Console", Monaco, monospace`,
				whiteSpace: "pre",
				padding: "1em",
				fontSize: "1.3em",
				overflow: "auto",
				flexGrow: 1,
			};
			// You can render any custom fallback UI ¯\_(ツ)_/¯
			return (
				<div style={style}>
					<h1>Something went wrong ¯\_(ツ)_/¯</h1>
					<div>
						<a style={whiteColor} href="#" onClick={(e) => { e.preventDefault(); location.reload(); }}>
							<h2>Reload panel</h2>
						</a>
					</div>
					<div>
						<a style={whiteColor} href="#" onClick={(e) => { e.preventDefault(); Settings.reset(); }}>
							<h2>Reset panel state</h2>
						</a>
					</div>
					<div style={stack}>{this.state.error?.stack}</div>
				</div>
			);
		}
    
		return this.props.children;
	}
}