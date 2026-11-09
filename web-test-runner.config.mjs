import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

/** @type {import('@web/test-runner').TestRunnerConfig} */
const config = {
  files: 'test/**/*.test.ts',
  nodeResolve: true,
  concurrency: 1,
  plugins: [esbuildPlugin({ ts: true, target: 'es2022' })],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  testFramework: { config: { timeout: 5000 } },
};

export default config;
