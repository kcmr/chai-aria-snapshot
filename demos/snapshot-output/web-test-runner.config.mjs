import { playwrightLauncher } from '@web/test-runner-playwright';
import baseConfig from '../../web-test-runner.config.mjs';

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  ...baseConfig,
  files: 'demos/snapshot-output/stored.test.ts',
  browsers: [playwrightLauncher({ product: 'chromium' })],
};
