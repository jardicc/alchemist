export interface ISetDataAction {
	type: "SET_DATA"
	payload: string
}

export function setDataAction(data:string): ISetDataAction{
	return {
		type: "SET_DATA",
		payload: data,
	};
}


export type TAtnActions = ISetDataAction