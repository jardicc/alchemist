// Mock for the Photoshop UXP host API.
// Keep stubs minimal — add more when tests that touch PS-heavy paths are added.

const actionMock = {
	batchPlay: jest.fn().mockResolvedValue([]),
	addNotificationListener: jest.fn(),
	removeNotificationListener: jest.fn(),
};

const appMock = {
	activeDocument: null,
	documents: [],
	eventNotifier: {addNotificationListener: jest.fn(), removeNotificationListener: jest.fn()},
};

const coreMock = {
	getHostEnvironment: jest.fn().mockResolvedValue({}),
	executeAsModal: jest.fn(async (callback) => callback({hostControl: {}})),
	performMenuCommand: jest.fn().mockResolvedValue(undefined),
	translateUIString: jest.fn((s) => s),
};

const psMock = {
	default: {action: actionMock, app: appMock, core: coreMock},
	action: actionMock,
	app: appMock,
	core: coreMock,
};

module.exports = psMock;
