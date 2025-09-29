import js from '@eslint/js';
import ts from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    // Global ignores
    { ignores: ['dist/**', '**/node_modules/**', '**/*.d.ts', 'eslint.config.*'] },

    // JS files: plain JS rules only
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        ...js.configs.recommended
    },

    // TS files: first the non-type-checked rules (fast baseline)
    ...ts.configs.recommended,

    // TS files: type-checked rules (includes @typescript-eslint/await-thenable)
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: ts.parser,
            parserOptions: {
                project: ['./tsconfig.eslint.json'],     // <-- important
                tsconfigRootDir: new URL('.', import.meta.url)
            }
        },
        plugins: { '@typescript-eslint': ts.plugin },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        }
    },

    // Turn off formatting rules that conflict with Prettier
    eslintConfigPrettier
];
