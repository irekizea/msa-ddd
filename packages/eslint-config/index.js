// packages/eslint-config/index.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Base flat config for the whole monorepo.
 * Usage: in root eslint.config.js -> `import base from "@msaddd/eslint-config"; export default base();`
 */
export default function base() {
    return [
        // Global ignores
        {
            ignores: [
                "**/node_modules/**",
                "**/dist/**",
                "**/build/**",
                "**/.next/**",
                "**/coverage/**"
            ]
        },

        // JS recommended
        js.configs.recommended,

        // TypeScript (type-checked)
        ...tseslint.config({
            parserOptions: {
                // IMPORTANT: resolve tsconfig from the *consumer* repo, not from this package location
                project: true,
                tsconfigRootDir: process.cwd()
            },
            extends: [
                ...tseslint.configs.strictTypeChecked,
                ...tseslint.configs.stylisticTypeChecked
            ],
            rules: {
                "@typescript-eslint/consistent-type-imports": "warn",
                "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
            }
        }),

        // Language options for all code
        {
            files: ["**/*.{ts,tsx,js,jsx}"],
            languageOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                globals: {
                    ...globals.es2024
                }
            }
        },

        // Node defaults (services, scripts)
        {
            files: [
                "apps/**/src/**/*.{ts,tsx,js,jsx}",
                "packages/**/src/**/*.{ts,tsx,js,jsx}",
                "scripts/**/*.{ts,js}"
            ],
            languageOptions: {
                globals: { ...globals.node }
            }
        },

        // Browser defaults (web apps)
        {
            files: [
                "apps/**/{app,pages,components,src}/**/*.{ts,tsx,js,jsx}"
            ],
            languageOptions: {
                globals: { ...globals.browser }
            },
            rules: {
                "no-alert": "warn"
            }
        },

        // Tests
        {
            files: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
            rules: {
                "no-console": "off"
            }
        }
    ];
}
