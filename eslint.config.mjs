import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
	tseslint.configs.strictTypeChecked,
	reactHooks.configs.flat["recommended-latest"],
	tseslint.configs.stylisticTypeChecked.map((config) => ({
		...config,
		files: ["**/*.ts", "**/*.tsx"], // We use TS config only for TS files
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	})),
	{
		rules: {
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					"checksVoidReturn": {
						"attributes": false,
						"returns": false,
					},
				},
			],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": "warn",

			// ----- style / whitespace -----
			quotes: ["warn", "double"],
			semi: ["warn", "always"],
			"comma-dangle": ["warn", "always-multiline"],
			"no-trailing-spaces": "warn",
			"eol-last": ["warn", "always"],
			"indent": ["warn", "tab", {SwitchCase: 1}],
			"no-multiple-empty-lines": ["warn", {max: 1, maxEOF: 0}],
			"space-before-blocks": ["warn", "always"],
			"keyword-spacing": ["warn", {before: true, after: true}],
			"comma-spacing": ["warn", {"before": false, "after": true}],
			"key-spacing": ["warn", {"beforeColon": false, "afterColon": true}],
		},
	},
	{
		files: ["**/*.js", "**/*.mjs"],
		extends: [
			tseslint.configs.disableTypeChecked],
	},
);