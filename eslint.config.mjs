import tseslint from "typescript-eslint";

export default tseslint.config(
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked.map((config) => ({
		...config,
		files: ["**/*.ts", "**/*.tsx"], // We use TS config only for TS files
		languageOptions: {
			parserOptions: {
				projectService: true,
				project: "./tsconfig.json",
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
			// everything is double quoted
			quotes: ["error", "double"],
			semi: ["error", "always"],
			"comma-dangle": ["error", "always-multiline"],
		},
	},
	{
		files: ["**/*.js", "**/*.mjs"],
		extends: [tseslint.configs.disableTypeChecked],
	},
);