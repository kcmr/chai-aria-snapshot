import { chai, expect, fixture, fixtureCleanup, html } from '@open-wc/testing';
import * as directChai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';
import type { EmailField } from './fixtures/email-field.js';
import './fixtures/email-field.js';
import { rejectionOf } from './test-support/helpers.js';

chai.use(chaiAriaSnapshot);

describe('Lit and the Chai instance supplied by open-wc', () => {
  let field: EmailField;

  beforeEach(async () => {
    field = await fixture<EmailField>(html`
      <snapshot-test-email-field></snapshot-test-email-field>
    `);
    await field.updateComplete;
  });

  afterEach(() => fixtureCleanup());

  it('matches a rendered Lit component after updateComplete', async () => {
    await expect(field).to.matchAriaSnapshot(`
      - /children: deep-equal
      - text: Email
      - textbox "Email"
      - paragraph: Use your work email.
    `);
  });

  it('matches asynchronous validation without relying on unsupported invalid attributes', async () => {
    await field.validate('invalid email');
    await field.updateComplete;
    await expect(field).to.matchAriaSnapshot(`
      - /children: deep-equal
      - text: Email
      - textbox "Email": invalid email
      - paragraph: Use your work email.
      - alert: Enter a valid email.
    `);
  });

  it('removes the error after the value becomes valid', async () => {
    await field.validate('invalid email');
    await field.updateComplete;
    await expect(field).to.matchAriaSnapshot(`
      - alert: Enter a valid email.
    `);

    await field.validate('person@example.com');
    await field.updateComplete;
    await expect(field).to.matchAriaSnapshot(`
      - /children: deep-equal
      - text: Email
      - textbox "Email": person@example.com
      - paragraph: Use your work email.
    `);
  });

  it('throws open-wc Chai errors rather than errors from another Chai instance', async () => {
    const error = await rejectionOf(
      expect(field).to.matchAriaSnapshot(
        `
          - checkbox "Email"
        `,
        { timeout: 0 },
      ),
    );
    expect(error).to.be.instanceOf(chai.AssertionError);
    expect(error).not.to.be.instanceOf(directChai.AssertionError);
    expect(error).to.have.property('showDiff', true);
  });
});
