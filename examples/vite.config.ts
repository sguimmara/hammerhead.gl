import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import glsl from 'vite-plugin-glsl';
import { resolve } from 'path';
import { globSync } from 'glob';

function collectInputs(root: string) {
    const result = {};

    let suffix = 0;

    for (const page of globSync(`${root}/**/*.html`)) {
        result[`entry${suffix++}`] = page;
    }

    return result;
}

export default defineConfig({
  test: {
  },
  plugins: [
    glsl({
      defaultExtension: 'wgsl',
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      input: collectInputs(__dirname),
    }
  }
});
