import type * as chai from 'chai';
import { compileTemplate, matchTemplate } from './ivya-adapter.js';

const MAX_RETRY_DELAY_MS = 50;

/** Options for an asynchronous ARIA snapshot assertion. */
export interface AriaSnapshotOptions {
  /**
   * Maximum retry duration in milliseconds. Must be finite and non-negative.
   * Set to `0` to capture and compare once.
   *
   * @defaultValue 1000
   */
  timeout?: number;
}

declare global {
  namespace Chai {
    interface Assertion {
      /**
       * Checks the accessible structure of the connected Element passed to
       * `expect`. The supplied Element is the snapshot root; select a descendant
       * explicitly to check that subtree. Always await this assertion.
       * This assertion does not create snapshot files or update test sources.
       *
       * Captures and compares again until the assertion passes or times out,
       * waiting at most 50 ms between attempts. Retries keep the original Element
       * reference. With `.not`, the first observed mismatch passes; this does not
       * guarantee a mismatch throughout the timeout.
       *
       * @param expectedYaml - Non-empty YAML ARIA template. Common indentation is
       * removed while preserving relative nesting. Omitted constraints allow
       * partial matching; use `/children: equal` or `/children: deep-equal` when
       * exact child structure is required.
       * @param options - Retry options; the default timeout is 1000 ms.
       * @returns A promise that resolves when the assertion passes. Invalid input
       * and template errors reject immediately, including with `.not`. A mismatch
       * at the timeout rejects with the registered Chai instance's AssertionError,
       * including `actual`, `expected`, and `showDiff` for the diff.
       *
       * @example
       * ```ts
       * await expect(button).to.matchAriaSnapshot(`
       *   - button "Save" [pressed=false]
       * `);
       * await expect(button).not.to.matchAriaSnapshot(`
       *   - checkbox "Save"
       * `, { timeout: 0 });
       * ```
       */
      matchAriaSnapshot(
        expectedYaml: string,
        options?: AriaSnapshotOptions,
      ): Promise<void>;
    }
  }
}

async function assertSnapshot(
  element: unknown,
  expectedYaml: string,
  negate: boolean,
  AssertionError: typeof chai.AssertionError,
  { timeout = 1000 }: AriaSnapshotOptions = {},
): Promise<void> {
  if (!Number.isFinite(timeout) || timeout < 0) {
    throw new TypeError('timeout must be a non-negative finite number.');
  }

  const compiled = compileTemplate(expectedYaml);
  const deadline = performance.now() + timeout;

  for (;;) {
    const result = matchTemplate(element, compiled);
    if (negate ? !result.matches : result.matches) return;

    const remaining = deadline - performance.now();
    if (remaining <= 0) {
      throw new AssertionError(
        `ARIA snapshot ${negate ? 'unexpectedly matched' : 'did not match'} after ${timeout}ms`,
        {
          actual: result.actual,
          expected: result.expected,
          showDiff: true,
        },
      );
    }

    await new Promise<void>((resolve) =>
      setTimeout(resolve, Math.min(MAX_RETRY_DELAY_MS, remaining)),
    );
  }
}

/**
 * Registers `matchAriaSnapshot` on the supplied Chai instance.
 *
 * Install with `chai.use(chaiAriaSnapshot)` before making snapshot assertions.
 * Importing the package does not register the plugin. Works with Chai directly
 * or the instance provided by `@open-wc/testing`.
 *
 * @param chai - Consumer's Chai instance, supplied by `chai.use`.
 * @param utils - Chai plugin utilities, supplied by `chai.use`.
 *
 * @example
 * ```ts
 * import * as chai from 'chai';
 * import { chaiAriaSnapshot } from 'chai-aria-snapshot';
 *
 * chai.use(chaiAriaSnapshot);
 * const button = document.querySelector('button');
 * await chai.expect(button).to.matchAriaSnapshot(`
 *   - button "Save" [pressed=false]
 * `);
 * ```
 */
export const chaiAriaSnapshot: Parameters<typeof chai.use>[0] = (
  chai,
  utils,
) => {
  chai.Assertion.addMethod(
    'matchAriaSnapshot',
    function (
      this: object,
      expectedYaml: string,
      options?: AriaSnapshotOptions,
    ): Promise<void> {
      const element: unknown = utils.flag(this, 'object');
      const negate = utils.flag(this, 'negate') === true;

      return assertSnapshot(
        element,
        expectedYaml,
        negate,
        chai.AssertionError,
        options,
      );
    },
  );
};
