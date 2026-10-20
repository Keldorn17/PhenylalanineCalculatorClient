// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            // Static fields
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            '#private-static-field',

            // Instance fields
            [
              'public-instance-field',
              'protected-instance-field',
              'private-instance-field',
              '#private-instance-field',
            ],

            // Constructors
            'constructor',

            // Static methods
            'public-static-method',
            'protected-static-method',
            'private-static-method',
            '#private-static-method',

            // Instance methods
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
            '#private-instance-method',
          ],
        },
      ],
      '@angular-eslint/inject-at-top': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/no-implicit-take-until-destroyed': 'error',
      '@angular-eslint/computed-must-return': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
    },
  },
);
