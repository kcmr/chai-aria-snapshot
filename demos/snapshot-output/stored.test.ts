import {
  getSnapshot,
  getSnapshotConfig,
  saveSnapshot,
} from '@web/test-runner-commands';
import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';
import { generateAriaTree, renderAriaTree } from 'ivya/aria';

chai.use(chaiAriaSnapshot);

describe('ARIA snapshot files managed by Web Test Runner', () => {
  it('compares against the YAML reference stored by the runner', async () => {
    const navigation = document.createElement('nav');
    navigation.setAttribute('aria-label', 'Guides');
    navigation.innerHTML = `
      <ul>
        <li><a href="/docs/intro">Getting started</a></li>
        <li><a href="/docs/api">API reference</a></li>
      </ul>
    `;
    document.body.append(navigation);

    try {
      const name = 'aria:guides';
      const { updateSnapshots } = await getSnapshotConfig();
      if (updateSnapshots) {
        // File persistence belongs to WTR; capture uses Ivya's public API.
        await saveSnapshot({
          name,
          content: renderAriaTree(generateAriaTree(navigation)),
        });
        return;
      }

      const expectedYaml = await getSnapshot({ name });
      if (expectedYaml === undefined) {
        throw new Error(
          'Missing reference. Run pnpm demo:snapshots:update and review the generated file.',
        );
      }
      await chai.expect(navigation).to.matchAriaSnapshot(expectedYaml);
    } finally {
      navigation.remove();
    }
  });
});
