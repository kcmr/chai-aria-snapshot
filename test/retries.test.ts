import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';
import { rejectionOf } from './test-support/helpers.js';

chai.use(chaiAriaSnapshot);
const { expect } = chai;

describe('Snapshot retries and timeouts', () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = document.createElement('button');
    button.textContent = 'Save';
    button.setAttribute('aria-pressed', 'false');
    document.body.append(button);
  });

  afterEach(() => button.remove());

  it('retries while an accessible state is changing', async () => {
    const timer = setTimeout(
      () => button.setAttribute('aria-pressed', 'true'),
      25,
    );
    try {
      await expect(button).to.matchAriaSnapshot(`
        - button "Save" [pressed=true]
      `);
    } finally {
      clearTimeout(timer);
    }
  });

  it('performs only the initial check when timeout is zero', async () => {
    const timer = setTimeout(
      () => button.setAttribute('aria-pressed', 'true'),
      0,
    );
    try {
      const error = await rejectionOf(
        expect(button).to.matchAriaSnapshot(
          `
            - button "Save" [pressed=true]
          `,
          { timeout: 0 },
        ),
      );
      expect(error).to.be.instanceOf(chai.AssertionError);
      chai.assert.strictEqual(button.getAttribute('aria-pressed'), 'false');
    } finally {
      clearTimeout(timer);
    }
  });

  it('stops retrying after a finite timeout', async () => {
    const error = await rejectionOf(
      expect(button).to.matchAriaSnapshot(
        `
          - button "Delete"
        `,
        { timeout: 60 },
      ),
    );
    expect(error).to.be.instanceOf(chai.AssertionError);
    expect(error).to.have.property('message').that.includes('after 60ms');
  });

  it('retries a negated assertion until the observed state differs', async () => {
    const timer = setTimeout(
      () => button.setAttribute('aria-pressed', 'true'),
      25,
    );
    try {
      await expect(button).not.to.matchAriaSnapshot(`
        - button "Save" [pressed=false]
      `);
      chai.assert.strictEqual(button.getAttribute('aria-pressed'), 'true');
    } finally {
      clearTimeout(timer);
    }
  });

  it('passes negation on the first mismatch without waiting for stability', async () => {
    const timer = setTimeout(
      () => button.setAttribute('aria-pressed', 'true'),
      0,
    );
    try {
      await expect(button).not.to.matchAriaSnapshot(`
        - button "Save" [pressed=true]
      `);
      chai.assert.strictEqual(button.getAttribute('aria-pressed'), 'false');
    } finally {
      clearTimeout(timer);
    }
  });

  it('fails immediately if the original Element disconnects during retries', async () => {
    const timer = setTimeout(() => button.remove(), 0);
    try {
      const error = await rejectionOf(
        expect(button).to.matchAriaSnapshot(`
          - button "Save" [pressed=true]
        `),
      );
      expect(error).to.be.instanceOf(TypeError);
    } finally {
      clearTimeout(timer);
    }
  });
});
