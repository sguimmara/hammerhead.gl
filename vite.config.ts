import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  test: {
  },
  plugins: [
    glsl({
      defaultExtension: 'wgsl',
    }),
    tsconfigPaths(),
  ],
});