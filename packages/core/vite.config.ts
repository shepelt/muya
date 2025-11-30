import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

import pkg from './package.json';

// eslint-disable-next-line node/prefer-global/process
const dirname = process.cwd();

export default defineConfig({
    build: {
        target: 'chrome70',
        outDir: 'lib',
        // Inline all assets as base64 for better bundler compatibility (Meteor, etc.)
        assetsInlineLimit: 100000, // 100KB - inline all icons
        lib: {
            entry: resolve(dirname, 'src/index.ts'),
            name: pkg.name,
            fileName: format => `${format}/index.js`,
            formats: ['es', 'umd', 'cjs'],
        },
    },
    test: {
        coverage: {
            include: ['src/**/*.ts'],
            reporter: ['html', 'text', 'json'],
            provider: 'istanbul',
        },
    },
    plugins: [
        dts({
            entryRoot: 'src',
            outDir: 'lib/types',
        }),
        // Removed libAssetsPlugin - we inline assets instead for better compatibility
    ],
});
