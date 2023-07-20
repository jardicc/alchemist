// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'no-async-promise-executor': ['error'],
    'prefer-promise-reject-errors': ['error'],
    'require-await': ['error'],
    'no-unreachable-loop': ['error'],
    'no-promise-executor-return': ['error'],
    indent: ['error', 'tab', { SwitchCase: 1 }],
    'linebreak-style': ['error', 'windows'],
    quotes: ['error', 'double'],
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always']
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        project: ['./tsconfig.json'] // Specify it only for TypeScript files
      },
      rules: {
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: {
              // false to make it better work with React
              attributes: false,
              returns: false
            }
          }
        ],
        '@typescript-eslint/promise-function-async': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',

        '@typescript-eslint/no-empty-interface': 'off'
      }
    }
  ]
}
