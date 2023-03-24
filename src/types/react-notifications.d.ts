
declare module "react-notifications" {
	import React from "react";

	export const NotificationContainer: React.ComponentType;
	export const NotificationManager: NotificationManagerConstructor;

	class NotificationManagerConstructor {
		constructor ()
		info: (message: string, title?: string, timeout?: number, callback?: () => void) => void
		success: (message: string, title?: string, timeout?: number, callback?: () => void) => void
		warning: (message: string, title?: string, timeout?: number, callback?: () => void) => void
		error: (message: string, title?: string, timeout?: number, callback?: () => void) => void
	}

}