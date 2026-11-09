# Plugin contract

The public API is a Chai plugin registered explicitly on the consumer's instance:
`chai.use(chaiAriaSnapshot)`. Importing the package must not register it globally.

`matchAriaSnapshot(expectedYaml, { timeout? })` returns `Promise<void>`. It accepts
a connected Element selected by the caller and a non-empty YAML template. There
is no recursive root search or automatic test-file update.

See the [README](../README.md) for the boundary between assertion values, diff
reporting, and file management. File persistence stays outside the plugin API.

Use the public `ivya/aria` API for capture, parsing, and matching. Keep Ivya as an
external runtime dependency and Chai as a peer. Do not import a Chai instance,
runners, open-wc, Lit, Playwright, or filesystem APIs into `src/`.

Parse once after removing common indentation, preserving relative YAML nesting.
Capture and match again on each retry. Use the matcher's boolean result, not string
equality. Use `result.resolved` as `actual` and the rendered parsed template as
`expected` for assertion diffs.

The default timeout is 1000 ms, with at most 50 ms between attempts. A timeout of
zero performs one check. Input and parser errors fail immediately, including for
negated assertions. Negation succeeds on the first observed mismatch; it does not
guarantee absence throughout the timeout. Keep the original Element reference
during retries.

Use the consumer's `AssertionError`, with `actual`, `expected`, and `showDiff`.
Do not hide engine errors or implement missing ARIA behavior locally. Ivya 1.8.2
does not support the `[invalid]` snapshot attribute.

# Validation

See [pending work](TODO.md) for the planned Chai compatibility matrix.

Behavior must be tested in real browsers. Keep the test runner configuration
separate from the library build. Use concurrency 1: parallel background pages
previously caused open-wc fixtures to stall waiting for animation frames.

Test both direct Chai and the Chai instance supplied by open-wc. Check built
package exports and declaration consumption as well as behavior. Claim support
only for dependency versions and browser scenarios actually exercised.

`pnpm test` builds the package and runs the browser suite through its public
exports in Chromium, Firefox, and WebKit. See [Development](../README.md#development)
for setup and commands.
Tests cover Chai 6 directly and open-wc's bundled Chai 4; Chai 5 is not currently
included in the declared peer range. Compile-only cases live in
`test/types/public-types.ts`.

CI uses the official Playwright Docker image with browsers and system dependencies
preinstalled. Keep its tag aligned with the resolved Playwright version in
`pnpm-lock.yaml` when updating dependencies.

Tests consume the built package declarations: run `pnpm build` before standalone
type checks on a fresh checkout. The compile-only cases share the test TypeScript
program with open-wc; they do not establish isolated consumer compatibility.

The optional VS Code template configures the native TypeScript 7 language server.
Local `.vscode/settings.json` is ignored by Git; change the template for shared
editor defaults.

open-wc's DOM matcher types add asynchronous equality overloads to Chai globally.
Use Chai's synchronous `assert` helpers for ordinary equality checks in this shared
test TypeScript program; keep snapshot expectations in the `expect` style.

The browser runner uses a targeted pnpm override for `errorstacks` 2.4.1:
2.4.2 requires Node 24, while this project supports Node 22. Remove the override
when upstream restores compatibility or the project's Node requirement changes.
