module.exports = {
	root: true,
	env: {browser: true, es2020: true},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended"
	],
	ignorePatterns: ["dist", ".eslintrc.cjs"],
	parser: "@typescript-eslint/parser",
	plugins: ["react-refresh", "import"],
	rules: {
		"react-refresh/only-export-components": ["warn", {allowConstantExport: true}],
		
		
		"import/no-cycle": ["error", { maxDepth: 1 }],
		"import/no-self-import": "error",
		"import/no-useless-path-segments": "warn",
	}
};
