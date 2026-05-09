// Mock for the UXP host API — only the surface used by the codebase.
// Keep this minimal; add more stubs if tests start importing UXP-heavy paths.

const storageMock = {
	localFileSystem: {
		getFolder: jest.fn().mockResolvedValue(null),
		getFileForOpening: jest.fn().mockResolvedValue(null),
		getFileForSaving: jest.fn().mockResolvedValue(null),
	},
	FileSystemProvider: class { },
	Entry: class { },
	File: class { },
	Folder: class { },
	formats: {
		utf8: "utf8",
		binary: "binary",
	},
};

const entrypointsMock = {
	setup: jest.fn(),
};

const versionsMock = {
	uxp: "6.0.0-0",
	plugin: "1.0.0",
};

const pluginManagerMock = {
	plugins: [],
};

const uxpDefault = {
	pluginManager: pluginManagerMock,
	versions: versionsMock,
	storage: storageMock,
	entrypoints: entrypointsMock,
};

module.exports = {
	default: uxpDefault,
	storage: storageMock,
	entrypoints: entrypointsMock,
	versions: versionsMock,
	pluginManager: pluginManagerMock,
};
