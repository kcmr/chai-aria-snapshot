import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';

chai.use(chaiAriaSnapshot);
const { expect } = chai;

describe('Accessible structure and explicit snapshot scope', () => {
  let host: HTMLDivElement;
  let root: ShadowRoot;
  let button: HTMLButtonElement;

  beforeEach(() => {
    host = document.createElement('div');
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <h2><button id="details" aria-expanded="false" aria-controls="content">Details</button></h2>
      <section id="content" aria-labelledby="details" hidden>
        <slot></slot>
        <p>Choose a guide.</p>
      </section>
    `;
    host.innerHTML = `
      <p>Slotted content.</p>
      <ul>
        <li><a href="/docs/intro">Getting started</a></li>
        <li><a href="/docs/api">API reference</a></li>
      </ul>
    `;
    button = root.querySelector('button')!;
    const region = root.querySelector('section')!;
    button.addEventListener('click', () => {
      button.setAttribute('aria-expanded', String(region.hidden));
      region.hidden = !region.hidden;
    });
    document.body.append(host);
  });

  afterEach(() => host.remove());

  it('excludes collapsed content from the accessible tree', async () => {
    await expect(host).to.matchAriaSnapshot(`
      - /children: deep-equal
      - heading "Details" [level=2]:
        - button "Details" [expanded=false]
    `);
  });

  it('preserves nested YAML for multiple roots, slots, lists, and URLs', async () => {
    button.click();
    await expect(host).to.matchAriaSnapshot(`
      - /children: deep-equal
      - heading "Details" [level=2]:
        - button "Details" [expanded=true]
      - region "Details":
        - paragraph: Slotted content.
        - list:
          - listitem:
            - link "Getting started":
              - /url: /docs/intro
          - listitem:
            - link "API reference":
              - /url: /docs/api
        - paragraph: Choose a guide.
    `);
  });

  it('requires the caller to select the node that starts the expectation', async () => {
    button.click();
    await expect(host).not.to.matchAriaSnapshot(`
      - link "Getting started":
        - /url: /docs/intro
    `);
    await expect(host.querySelector('a')).to.matchAriaSnapshot(`
      - link "Getting started":
        - /url: /docs/intro
    `);
    await expect(button).to.matchAriaSnapshot(`
      - button "Details" [expanded=true]
    `);
  });

  it('matches equivalent heading semantics and detects a changed level', async () => {
    const heading = root.querySelector('h2')!;
    const replacement = document.createElement('div');
    replacement.setAttribute('role', 'heading');
    replacement.setAttribute('aria-level', '2');
    replacement.append(button);
    heading.replaceWith(replacement);

    await expect(host).to.matchAriaSnapshot(`
      - heading "Details" [level=2]:
        - button "Details" [expanded=false]
    `);
    replacement.setAttribute('aria-level', '3');
    await expect(host).not.to.matchAriaSnapshot(`
      - heading "Details" [level=2]
    `);
  });

  it('checks list order and URL constraints', async () => {
    button.click();
    await expect(host.querySelector('ul')).not.to.matchAriaSnapshot(`
      - list:
        - listitem:
          - link "API reference"
        - listitem:
          - link "Getting started"
    `);
    await expect(host.querySelector('a')).not.to.matchAriaSnapshot(`
      - link "Getting started":
        - /url: /wrong-url
    `);
    await expect(host.querySelector('a')).to.matchAriaSnapshot(`
      - link /Getting/:
        - /url: /docs/intro
    `);
  });

  it('distinguishes contain, equal, and deep-equal child matching', async () => {
    button.click();
    await expect(host).to.matchAriaSnapshot(`
      - region "Details":
        - paragraph: Choose a guide.
    `);
    await expect(host).not.to.matchAriaSnapshot(`
      - region "Details":
        - /children: equal
        - paragraph: Choose a guide.
    `);
    await expect(host).to.matchAriaSnapshot(`
      - /children: equal
      - heading "Details"
      - region "Details"
    `);
    await expect(host).not.to.matchAriaSnapshot(`
      - /children: deep-equal
      - heading "Details"
      - region "Details"
    `);
  });
});
