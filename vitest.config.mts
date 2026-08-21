import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Vite resolves tsconfig `paths` natively now, so the `@/*` alias needs no plugin.
  resolve: { tsconfigPaths: true },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
