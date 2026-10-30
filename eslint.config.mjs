import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: process.cwd() });
export default defineConfig([
  ...compat.extends(...nextVitals.extends),
  globalIgnores(['.next/**', 'node_modules/**'])
]);
