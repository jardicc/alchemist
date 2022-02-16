/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionDescriptor, app, Descriptor } from "photoshop";

export const syncBatchPlay = (desc: ActionDescriptor[]): Descriptor[] => {
	const result = app.batchPlay(desc, {
		synchronousExecution: true,
	}) as any;
	return result;
};
