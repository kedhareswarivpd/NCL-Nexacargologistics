import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Cosmetic rule about apostrophes/quotes in JSX text. Disabled project-wide
      // so straight punctuation in copy doesn't fail the production build.
      "react/no-unescaped-entities": "off",
      // Allow interfaces that only extend another type (used by UI primitives).
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow any type for complex dynamic data (dashboards, API responses).
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars prefixed with _ (intentionally unused).
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Allow setState in effects (common pattern for data fetching).
      "react-hooks/set-state-in-effect": "off",
      // Allow comment text nodes in JSX.
      "react/jsx-no-comment-textnodes": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
