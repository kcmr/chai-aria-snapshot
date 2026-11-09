import { expect, use } from 'chai';
import { chaiAriaSnapshot, type AriaSnapshotOptions } from 'chai-aria-snapshot';

// Compiled by typecheck; not executed by the browser runner.
export async function checkPublicTypes(el: Element): Promise<void> {
  use(chaiAriaSnapshot);
  const options: AriaSnapshotOptions = { timeout: 0 };
  const assertion: Promise<void> = expect(el).to.matchAriaSnapshot(
    '- button',
    options,
  );
  await assertion;
  await expect(el).not.to.matchAriaSnapshot('- checkbox');

  // @ts-expect-error A YAML template must be a string.
  await expect(el).matchAriaSnapshot(42);
  // @ts-expect-error Timeout must be numeric.
  await expect(el).matchAriaSnapshot('- button', { timeout: '1' });
  // @ts-expect-error Recursive root search is not part of the API.
  await expect(el).matchAriaSnapshot('- button', { recursive: true });
}
