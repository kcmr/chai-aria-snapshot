import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';
import { rejectionOf } from './test-support/helpers.js';

chai.use(chaiAriaSnapshot);
const { expect } = chai;

describe('Assertion errors and diffs', () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = document.createElement('button');
    button.textContent = 'Save';
    button.setAttribute('aria-pressed', 'false');
    document.body.append(button);
  });

  afterEach(() => button.remove());

  it('uses the consumer AssertionError and exposes a diff', async () => {
    try {
      await expect(button).to.matchAriaSnapshot(
        `
          - button "Delete"
        `,
        { timeout: 0 },
      );
      expect.fail('Expected a snapshot mismatch.');
    } catch (error) {
      expect(error).to.be.instanceOf(chai.AssertionError);
      expect(error).to.include({
        actual: '- button "Save"',
        expected: '- button "Delete"',
        showDiff: true,
      });
    }
  });

  it('keeps matching regexes in the diff instead of literal DOM names', async () => {
    const error = await rejectionOf(
      expect(button).to.matchAriaSnapshot(
        `
          - button /Sa.e/
          - region "Missing"
        `,
        { timeout: 0 },
      ),
    );
    expect(error).to.be.instanceOf(chai.AssertionError);
    expect(error).to.have.property('actual').that.includes('/Sa.e/');
    expect(error).to.have.property('expected').that.includes('/Sa.e/');
  });
});
