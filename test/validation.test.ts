import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';
import { rejectionOf } from './test-support/helpers.js';

chai.use(chaiAriaSnapshot);
const { expect } = chai;

describe('Snapshot input validation', () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = document.createElement('button');
    button.textContent = 'Save';
    button.setAttribute('aria-pressed', 'false');
    document.body.append(button);
  });

  afterEach(() => button.remove());

  it('rejects values that are not connected Elements, also with negation', async () => {
    for (const value of [
      null,
      undefined,
      'button',
      document,
      document.createTextNode('Plain text'),
      document.createElement('div'),
    ]) {
      const error = await rejectionOf(
        expect(value).not.to.matchAriaSnapshot(`
          - button
        `),
      );
      expect(error).to.be.instanceOf(TypeError);
      expect(error).to.have.property('message').that.includes('connected');
    }
  });

  it('rejects empty and non-string templates', async () => {
    for (const template of ['', ' \n ', null, 1]) {
      const error = await rejectionOf(
        expect(button).to.matchAriaSnapshot(template as string),
      );
      expect(error).to.be.instanceOf(TypeError);
      expect(error).to.have.property('message').that.includes('non-empty');
    }
  });

  it('rejects invalid timeouts', async () => {
    for (const timeout of [-1, NaN, Infinity, -Infinity, '50']) {
      const error = await rejectionOf(
        expect(button).to.matchAriaSnapshot(
          `
            - button
          `,
          { timeout: timeout as number },
        ),
      );
      expect(error).to.be.instanceOf(TypeError);
      expect(error).to.have.property('message').that.includes('timeout');
    }
  });

  it('propagates malformed YAML before waiting for another attempt', async () => {
    let waited = false;
    const timer = setTimeout(() => (waited = true), 0);
    try {
      const error = await rejectionOf(
        expect(button).to.matchAriaSnapshot(`
          - [button
        `),
      );
      expect(error).to.be.instanceOf(Error);
      expect(error).not.to.be.instanceOf(chai.AssertionError);
      chai.assert.isFalse(waited);
    } finally {
      clearTimeout(timer);
    }
  });

  it('does not treat an unsupported attribute as a successful negation', async () => {
    const error = await rejectionOf(
      expect(button).not.to.matchAriaSnapshot(`
        - button "Save" [invalid=true]
      `),
    );
    expect(error).not.to.be.instanceOf(chai.AssertionError);
    expect(error)
      .to.have.property('message')
      .that.includes('Unsupported attribute');
  });
});
