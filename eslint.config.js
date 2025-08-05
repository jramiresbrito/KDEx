import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', '**/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        vi: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        context: 'readonly',
        suite: 'readonly',
        it: 'readonly',
        specify: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        before: 'readonly',
        after: 'readonly',
        setup: 'readonly',
        teardown: 'readonly',
        suiteSetup: 'readonly',
        suiteTeardown: 'readonly',
        // Pending/skip functions
        xit: 'readonly',
        xspecify: 'readonly',
        xdescribe: 'readonly',
        xcontext: 'readonly',
        // Hardhat globals
        ethers: 'readonly',
        hre: 'readonly',
        network: 'readonly',
        artifacts: 'readonly',
        waffle: 'readonly',
      },
    },
  },
  {
    files: ['scripts/**/*.js', 'ignition/**/*.js', 'hardhat.config.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        // Hardhat globals for scripts and config
        ethers: 'readonly',
        hre: 'readonly',
        network: 'readonly',
        artifacts: 'readonly',
        task: 'readonly',
        subtask: 'readonly',
        extendConfig: 'readonly',
        extendEnvironment: 'readonly',
      },
    },
  },
]
