import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';

chai.use(chaiAriaSnapshot);
const { expect } = chai;

describe('Snapshot matching and negation', () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = document.createElement('button');
    button.textContent = 'Save';
    button.setAttribute('aria-pressed', 'false');
    document.body.append(button);
  });

  afterEach(() => button.remove());

  it('matches roles, accessible names, and explicit false states', async () => {
    await expect(button).to.matchAriaSnapshot(`
      - button "Save" [pressed=false]
    `);
    button.setAttribute('aria-pressed', 'true');
    await expect(button).to.matchAriaSnapshot(`
      - button "Save" [pressed=true]
    `);
  });

  it('supports partial templates, regexes, and negation', async () => {
    await expect(button).to.matchAriaSnapshot(`
      - button
    `);
    await expect(button).to.matchAriaSnapshot(`
      - button /Sa.e/
    `);
    await expect(button).not.to.matchAriaSnapshot(`
      - checkbox "Save"
    `);
  });

  it('fails a negated assertion when the snapshot matches', async () => {
    try {
      await expect(button).not.to.matchAriaSnapshot(
        `
          - button "Save"
        `,
        { timeout: 0 },
      );
      expect.fail('Expected a negated snapshot mismatch.');
    } catch (error) {
      expect(error).to.be.instanceOf(chai.AssertionError);
      expect(error)
        .to.have.property('message')
        .that.includes('unexpectedly matched');
    }
  });

  it('normalizes CRLF without changing relative indentation', async () => {
    const heading = document.createElement('h2');
    button.replaceWith(heading);
    heading.append(button);
    button.textContent = 'Details';
    try {
      await expect(heading).to.matchAriaSnapshot(
        `
        - heading "Details" [level=2]:
          - button "Details" [pressed=false]
      `.replace(/\n/g, '\r\n'),
      );
    } finally {
      heading.remove();
    }
  });
});
