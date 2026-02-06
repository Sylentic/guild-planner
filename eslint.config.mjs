import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import i18next from "eslint-plugin-i18next";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      i18next,
    },
    rules: {
      // Warn about text content that should probably be translated
      "i18next/no-literal-string": ["warn", {
        // Allow these patterns to not require translation
        markupOnly: true, // Only check JSX text content, not JS strings
        ignoreAttribute: ["className", "style", "type", "id", "name", "data-", "aria-", "role", "key", "href", "src", "alt"],
        ignore: ["^[A-Z_]+$", "^\\d+$"], // Ignore all-caps constants and numbers
      }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts are utility tools with different standards
    "scripts/**",
  ]),
]);

export default eslintConfig;
