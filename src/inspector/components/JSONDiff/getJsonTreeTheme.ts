export default function getJsonTreeTheme(base16Theme:any) {
	return {
		extend: base16Theme,
		nestedNode: ({ style }:any, keyPath:any, nodeType:any, expanded:boolean) => ({
			style: {
				...style,
				whiteSpace: expanded ? "inherit" : "nowrap"
			}
		}),
		nestedNodeItemString: ({ style }:any, keyPath:any, nodeType:any, expanded:boolean) => ({
			style: {
				...style,
				display: expanded ? "none" : "inline"
			}
		})
	};
}