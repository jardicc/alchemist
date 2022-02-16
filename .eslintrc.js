// eslint-disable-next-line no-undef
module.exports = {
	"env": {
		"browser": true,
		"es2020": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/recommended",
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true,
		},
		"ecmaVersion": 11,
		"sourceType": "module",
	},
	"plugins": [
		"react",
		"@typescript-eslint",
	],
	"rules": {
		"no-unreachable-loop": [
			"error",
		],
		"no-promise-executor-return": [
			"error",
		],
		"indent": [
			"error",
			"tab",
			{ "SwitchCase": 1 },
		],
		"linebreak-style": [
			"error",
			"unix",
		],
		"quotes": [
			"error",
			"double",
		],
		"comma-dangle": [
			"error",
			"always-multiline",
		],
		"semi": [
			"error",
			"always",
		],
	},
};
