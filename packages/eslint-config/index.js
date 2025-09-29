// packages/eslint-config/index.js
// ESM (type: module)

import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';

// Optional peer: eslint-config-prettier
let eslintConfigPrettier;
try {
    eslintConfigPrettier = (await import('eslint-config-prettier')).default;
} catch {
    // not installed -> skip
}

function typedTsBlock(projectGlobs) {
    return {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: ts.parser,
            parserOptions: {
                project: projectGlobs,
                // run from each workspace; works in monorepos
                tsconfigRootDir: process.cwd()
            },
            globals: { ...globals.node, ...globals.es2021 }
        },
        plugins: { '@typescript-eslint': ts.plugin },
        rules: {
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-misused-promises': ['warn', { checksVoidReturn: false }],
            '@typescript-eslint/consistent-type-imports': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        }
    };
}

/**
 * Create a monorepo-friendly ESLint config.
 * @param {Object} options
 * @param {boolean} [options.typed=true] - enable type-aware rules
 * @param {string[]} [options.projectGlobs] - tsconfig paths for typed lint
 * @param {boolean} [options.withPrettier=true] - include eslint-config-prettier if available
 */
export function createConfig({
                                 typed = true,
                                 projectGlobs = [
                                     'tsconfig.eslint.json',
                                     'apps/*/tsconfig.eslint.json',
                                     'packages/*/tsconfig.eslint.json'
                                 ],
                                 withPrettier = true
                             } = {}) {
    const config = [
        // 1) Global ignores (and skip linting config files themselves)
        { ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts', '**/generated/**', 'eslint.config.*'] },

        // 2) JS files
        {
            files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
            ...js.configs.recommended
        },

        // 3) TS baseline (non-typed, fast)
        ...ts.configs.recommended
    ];

    // 4) TS typed rules (needs tsconfig.eslint.json in each workspace)
    if (typed) config.push(typedTsBlock(projectGlobs));

    // 5) Disable stylistic rules if Prettier is present
    if (withPrettier && eslintConfigPrettier) config.push(eslintConfigPrettier);

    return config;
}

export default createConfig();
