# chai-aria-snapshot

A [Chai](https://www.chaijs.com/) plugin for asserting the accessible structure of DOM elements using YAML ARIA snapshots. Test roles, accessible names, states, reading order, and semantic hierarchy without coupling assertions to specific HTML tags.

It brings the approach of [Playwright ARIA snapshots](https://playwright.dev/docs/aria-snapshots) and [Vitest's ARIA snapshots](https://vitest.dev/guide/browser/aria-snapshots) (powered by [Ivya](https://github.com/vitest-dev/ivya)) to Chai.

## Installation

```sh
npm install -D chai-aria-snapshot
```

**Requirements:**

- **Chai** (`^4.3.4 || ^6.3.0`) provided by your project or test helpers (such as [`@open-wc/testing`](https://open-wc.org/docs/testing/testing-package/)).
- **A browser environment**: Assertions inspect the live DOM and accessible tree, so tests must run in a real browser (for example, with [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/)).

## Quick start

### With Chai

Register the plugin once with `chai.use(chaiAriaSnapshot)` (importing the package does not register it globally), then `await` assertions on any connected `Element`:

```ts
import * as chai from 'chai';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';

chai.use(chaiAriaSnapshot);

await chai.expect(button).to.matchAriaSnapshot(`
  - button "Save" [pressed=false]
`);

await chai.expect(button).not.to.matchAriaSnapshot(`
  - button "Save" [pressed=true]
`);
```

### With `@open-wc/testing`

Register the plugin on the `chai` instance exported by `@open-wc/testing`:

```ts
import { chai, expect, fixture, fixtureCleanup, html } from '@open-wc/testing';
import { chaiAriaSnapshot } from 'chai-aria-snapshot';

chai.use(chaiAriaSnapshot);
afterEach(fixtureCleanup);

it('renders a toggle button', async () => {
  const button = await fixture<HTMLButtonElement>(html`
    <button aria-pressed="false">Save</button>
  `);

  await expect(button).to.matchAriaSnapshot(`
    - button "Save" [pressed=false]
  `);
});
```

> **Tip:** When testing Lit components, await `element.updateComplete` after mutating reactive state before running assertions.

## Writing ARIA snapshots

### Template syntax

Each node in the YAML tree describes an accessible role, an optional accessible name, optional states/attributes, and optional child nodes or metadata. For example, given this HTML:

```html
<div>
  <h2>
    <button
      id="details-toggle"
      aria-expanded="true"
      aria-controls="details-panel"
    >
      Details
    </button>
  </h2>
  <section id="details-panel" aria-labelledby="details-toggle">
    <p>Learn how to use this feature.</p>
    <a href="/docs/intro">Getting started</a>
  </section>
</div>
```

The following template matches its accessible structure:

```yaml
- heading "Details" [level=2]:
    - button /Details|More info/ [expanded=true]
- region "Details":
    - paragraph: Learn how to use this feature.
    - link "Getting started":
        - /url: /docs/intro
```

- **Roles & names**: `- button "Details"` matches a `button` role with the exact name `"Details"`. Use regular expressions like `- button /Details|More info/` for flexible name matching, or omit the name (`- button`) to match any name.
- **States & attributes**: Bracketed attributes like `[expanded=true]`, `[pressed=false]`, `[checked=mixed]`, `[disabled]`, or `[level=2]` only check the attributes you explicitly write.
- **Text & properties**: Inline text (`- paragraph: Learn how to use this feature.`) and properties (`- /url: /docs/intro`) assert text content and link targets.

> **Tip:** Roles, accessible names, and states match the [accessibility tree in Chrome DevTools](https://developer.chrome.com/docs/devtools/accessibility/reference#tree), which is a handy way to inspect what a component exposes while writing snapshots.

For the full template syntax, see [Vitest's ARIA snapshot guide](https://vitest.dev/guide/browser/aria-snapshots). Supported attributes depend on the installed [Ivya](https://github.com/vitest-dev/ivya) version.

### Scope and Shadow DOM

The element passed to `expect(element)` is the root of the snapshot:

- Pass a host component to assert its full accessible output, or query a descendant to check a smaller subtree.
- Open Shadow DOM and slotted content are traversed automatically as part of the accessible tree.

For example, this host has a heading inside its open shadow root and a paragraph in the light DOM, projected through a `<slot>`:

```ts
const host = document.createElement('div');
const shadow = host.attachShadow({ mode: 'open' });
shadow.innerHTML = `
  <h2>Details</h2>
  <slot></slot>
`;
host.innerHTML = '<p>Learn how to use this feature.</p>';
document.body.append(host);

try {
  await expect(host).to.matchAriaSnapshot(`
    - heading "Details" [level=2]
    - paragraph: Learn how to use this feature.
  `);
} finally {
  host.remove();
}
```

The assertion starts at `host` and includes both the shadow heading and the slotted paragraph in their rendered order, without querying the shadow root separately.

### Partial vs. strict matching (`/children`)

Templates are **partial by default**: omitted names, states, and unlisted sibling elements are ignored, as long as the listed children appear in the specified order.

Use the `/children` directive to enforce strict child matching at a given level:

| Directive                      | Behavior                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `/children: contain` (default) | Listed children must appear in order; extra siblings are allowed.                  |
| `/children: equal`             | Only the listed children may appear at this level; their descendants stay partial. |
| `/children: deep-equal`        | The entire subtree must match the listed children and descendants exactly.         |

Place `/children` at the top of the template to constrain root nodes, or inside a parent node's block to constrain only that node's children:

```ts
await expect(accordion).to.matchAriaSnapshot(`
  - /children: deep-equal
  - heading "Details" [level=2]:
    - button "Details" [expanded=true]
  - region "Details":
    - paragraph: Learn how to use this feature.
    - list:
      - listitem:
        - link "Getting started":
          - /url: /docs/intro
      - listitem:
        - link "API reference":
          - /url: /docs/api
`);
```

> **Note:** Even with `deep-equal`, states and names remain opt-in per node. Writing `[pressed=false]` asserts that state; omitting it does not.

To see the difference between `equal` and `deep-equal`, consider this HTML, with `element` referring to the outer `<div>`:

```html
<div>
  <nav aria-label="Guides">
    <a href="/docs/intro">Getting started</a>
    <a href="/docs/api">API reference</a>
  </nav>
</div>
```

With `equal` at the root, the only child must be the navigation node. Its descendants still use partial matching, so the unlisted "API reference" link is allowed:

```ts
await expect(element).to.matchAriaSnapshot(`
  - /children: equal
  - navigation "Guides":
    - link "Getting started"
`);
```

With `deep-equal`, strict matching also applies inside the navigation node. The same template no longer matches because it omits the second link:

```ts
await expect(element).not.to.matchAriaSnapshot(`
  - /children: deep-equal
  - navigation "Guides":
    - link "Getting started"
`);
```

Listing both links would make the `deep-equal` template match too. An extra accessible sibling alongside the navigation node would prevent both templates from matching.

## API reference

```ts
await expect(element).to.matchAriaSnapshot(expectedYaml, options);
```

### Parameters

| Parameter         | Type      | Default      | Description                                                                                    |
| ----------------- | --------- | ------------ | ---------------------------------------------------------------------------------------------- |
| `element`         | `Element` | _(required)_ | A DOM `Element` connected to the document (`element.isConnected === true`).                    |
| `expectedYaml`    | `string`  | _(required)_ | Non-empty YAML ARIA template. Common leading indentation is stripped automatically.            |
| `options.timeout` | `number`  | `1000`       | Maximum retry time in milliseconds (must be finite and `>= 0`). Set to `0` for a single check. |

### Async behavior, retries, and negation

- **Always `await`**: `matchAriaSnapshot` returns a `Promise<void>` for both positive and `.not` assertions.
- **Automatic retries**: Capture and matching repeat (up to every 50 ms) until the assertion passes or `timeout` expires. Retries reuse the original `element` reference—if re-rendering replaces the DOM node, query the new element first.
- **Negation (`.not`)**: Resolves as soon as a mismatch is observed. To assert an immediate mismatch without waiting, pass `{ timeout: 0 }`:
  ```ts
  await expect(button).not.to.matchAriaSnapshot(
    `
      - button "Save" [pressed=true]
    `,
    { timeout: 0 },
  );
  ```
- **Fail-fast validation**: Disconnected or non-`Element` values, empty templates, invalid YAML syntax, and invalid `timeout` values reject immediately without retrying, even when negated with `.not`.

## Diffs and snapshot files

When an assertion fails after the timeout, the plugin throws your Chai instance's `AssertionError` with `{ actual, expected, showDiff: true }`.

- **Diff rendering** is handled by your test runner or reporter.
- **Snapshot files** are intentionally outside the plugin's scope—it never writes files or rewrites test source code. If you prefer stored `.snap` files over inline YAML, pair the plugin with your runner's snapshot helpers (such as `@web/test-runner-commands`).

See [demos/snapshot-output](demos/snapshot-output) for examples of inline diffs and runner-managed snapshot files.

## Development

### Prerequisites and setup

- **Node.js**: Version matching `engines.node` in [package.json](package.json) (`>=22.12.0`).
- **pnpm**: Version specified by `packageManager` in [package.json](package.json).
- **Playwright browsers**: Required to run the test suite in Chromium, Firefox, and WebKit.

```sh
pnpm install
pnpm browsers:install
pnpm check
```

> **Note:** On Linux, you may also need [Playwright's system dependencies](https://playwright.dev/docs/browsers#install-system-dependencies) to launch the browsers.

### Making changes

- Use `pnpm dev` to rebuild as you edit, or `pnpm test` to build and run the browser tests.
- Run `pnpm format` to format changes and `pnpm check` to run all quality checks before submitting a PR.

### Editor setup (optional)

If you use VS Code, [.vscode/settings.template.json](.vscode/settings.template.json) provides optional editor settings you can copy into your local `.vscode/settings.json`.

Tests consume the built package declarations. Run `pnpm build` if types are missing in your editor on a fresh checkout; `pnpm test` and `pnpm check` also build automatically.

### Testing in an external project

To test local changes in another repository before publishing, pack a tarball from the built output:

```sh
pnpm build
pnpm pack
```

Then install the generated `.tgz` archive in your consumer project:

```sh
pnpm add -D "/absolute/path/to/chai-aria-snapshot-<version>.tgz"
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for pull request guidelines, commit conventions, and required quality checks.

## License

Licensed under the [MIT License](LICENSE).
