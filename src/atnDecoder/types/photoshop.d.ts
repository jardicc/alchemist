/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-misused-new */
declare module "photoshop" {
	interface Photoshop {
		Document: Document;
		Layer: Layer;
		Photoshop: Photoshop;
		ActionSet: ActionSet;
		Action: Action;
	}

	interface Layer {
		new (...args: any[]): Layer;
		_id: number;
		_docId: number;
	}

	interface Document {
		new (...args: any[]): Document;
		_id: number;
	}

	interface Photoshop {
		new (...args: any[]): Photoshop;
	}

	interface BatchPlayError {
		number: number;
	}

	interface ActionSet {
		new (...args: any[]): ActionSet;
		_id: number;
	}

	interface Action {
		new (...args: any[]): Action;
		_id: number;
	}

	interface PhotoshopAction {
		addNotificationListener(events: { event: string }[], notifier: NotificationListener): Promise<void>;
		removeNotificationListener(events: { event: string }[], notifier: NotificationListener): Promise<void>;
	}
}
