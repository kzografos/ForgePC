import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

loadEnv({ path: '.env.test', override: false })

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const nuxtShim = fileURLToPath(new URL('./tests/setup/mocks/nuxt.ts', import.meta.url))
const supabaseServerStub = fileURLToPath(
  new URL('./tests/setup/mocks/supabase-server.ts', import.meta.url),
)

export default defineConfig({
  resolve: {
    alias: {
      '~': rootDir,
      '@': rootDir,
      '~~': rootDir,
      '@@': rootDir,
      '#imports': nuxtShim,
      '#app': nuxtShim,
      '#supabase/server': supabaseServerStub,
    },
  },
  test: {
    name: 'forgepc',
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      enabled: false,
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'stores/**/*.ts',
        'composables/**/*.ts',
        'utils/**/*.ts',
        'server/**/*.ts',
        'middleware/**/*.ts',
      ],
      exclude: [
        'components/ui/**',
        'pages/**',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        'tests/**',
        '.nuxt/**',
        '.output/**',
        'node_modules/**',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
})
