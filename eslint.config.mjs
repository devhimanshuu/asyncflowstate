import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/.next/**",
      "**/examples/**", // Ignore examples folder
      "**/docs/.vitepress/cache/**", // Ignore VitePress cache
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        // Browser globals
        AbortController: "readonly",
        AbortSignal: "readonly",
        FormData: "readonly",
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLFormElement: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      // JavaScript/TypeScript Best Practices
      ...js.configs.recommended.rules,

      // TypeScript Specific
      "@typescript-eslint/no-explicit-any": "off", // Allow any for generic library code
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off", // Allow for library code
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // General Code Quality
      "no-console": "off", // Allow console in library code
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-template": "warn",
      "prefer-arrow-callback": "warn",
      "no-duplicate-imports": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: "off", // Allow single-line if statements
      "no-throw-literal": "error",
      "no-unused-vars": "off", // Use TypeScript version
      "no-undef": "off", // TypeScript handles this
    },
  },
  {
    files: [
      "packages/react/**/*.{ts,tsx}",
      "packages/next/**/*.{ts,tsx}",
      "examples/react/**/*.{ts,tsx}",
      "examples/next/**/*.{ts,tsx}",
    ],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
    },
  },
];
