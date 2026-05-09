// jest.config.js
// eslint-disable-next-line no-undef
module.exports = {
	verbose: false,
	collectCoverage: false,
	testEnvironment: "jest-environment-jsdom",
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	testRegex: "(/test/.*|(\\.|/)(test|spec))\\.(tsx?)$",
	moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
	moduleDirectories: ["node_modules"],
	moduleNameMapper: {
		"\\.less$": "<rootDir>/src/__mocks__/styleMock.js",
		"^photoshop$": "<rootDir>/src/__mocks__/photoshop.js",
		"^photoshop/dom/CoreModules$": "<rootDir>/src/__mocks__/photoshopCoreModules.js",
		"^uxp$": "<rootDir>/src/__mocks__/uxp.js",
		"^react-uxp-spectrum$": "<rootDir>/src/__mocks__/react-uxp-spectrum.js",
	},
	globals: {
		"ts-jest": {
			tsconfig: "jest-tsconfig.json",
		},
	},
};