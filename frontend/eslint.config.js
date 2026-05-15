import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import i18next from 'eslint-plugin-i18next'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  {
    ignores: ['dist', 'node_modules', 'dev-dist', 'android', 'public'],
  },

  {
    files: ['tailwind.config.js', 'postcss.config.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'error',
      'no-unused-vars': 'warn',
    },
  },

  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'i18next': i18next,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      'react/prop-types': 'off',

      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^[A-Z_]',
        ignoreRestSiblings: true,
        destructuredArrayIgnorePattern: '^_',
      }],
      'no-console': ['error', { allow: ['warn', 'error'] }],

      'i18next/no-literal-string': ['error', {
        'markupOnly': true,
        'ignoreAttribute': [
          'style', 'className', 'path', 'd', 'viewBox',
          'type', 'name', 'id', 'key', 'role',
          'aria-label', 'aria-live', 'aria-hidden',
          'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin',
          'fill', 'xmlns', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r',
          'fillRule', 'clipRule', 'points',
        ],
      }],

      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
    },
  },
]
