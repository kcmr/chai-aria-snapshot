# chai-aria-snapshot

A Chai plugin for checking accessible DOM structure with inline YAML ARIA
snapshots, using the public `ivya/aria` engine without requiring Vitest.

HTML snapshots change when wrappers or classes change. ARIA snapshots describe
roles, accessible names, states, and semantic hierarchy: an `h2` and a `div` with
`role="heading"` and `aria-level="2"` can satisfy the same expectation.

The project is being bootstrapped. The package name is provisional, publication
is disabled, and the plugin API is not implemented yet.

## Development

Use Node.js 22.12.0 or newer and pnpm 10.14.0 (pinned in `packageManager`).

```sh
pnpm install --frozen-lockfile
```

Dependency ranges use `^`; the committed lockfile records the exact versions for
reproducible installs. The Node.js requirement is declared in `engines` and
enforced by pnpm through `engine-strict`.

Commit changes in small steps using Conventional Commits, for example
`chore: configure TypeScript`.

### TypeScript and build

```sh
pnpm typecheck
pnpm build
pnpm dev
```

TypeScript checks the browser library and Node.js tooling separately. The library
uses strict checking, native ESM imports, and DOM types without ambient Node.js
globals. `pnpm dev` rebuilds the library when sources change.

[Rslib](https://rslib.rs/guide/start/) generates ESM and declarations in `dist/`.
The entry point is intentionally empty until the plugin is implemented. Runtime
dependencies (including the future Ivya dependency) and peers (including Chai)
remain external to the bundle. Their versions and compatibility will be established
when the plugin and its browser tests are added.

### Lint and formatting

```sh
pnpm lint
pnpm format
pnpm format:check
pnpm check
```

[Oxlint](https://oxc.rs/docs/guide/usage/linter/type-aware.html) uses
`oxlint-tsgolint` for type-aware rules, including `no-floating-promises` and
`no-misused-promises`. Asynchronous Chai assertions must be awaited.
[Oxfmt](https://oxc.rs/docs/guide/usage/formatter/embedded-formatting.html) handles
formatting, with embedded language support enabled for future Lit demos. The
pnpm-generated lockfile is excluded from formatting.

VS Code recommends the official `oxc.oxc-vscode` extension. The workspace settings
apply Oxlint fixes first and Oxfmt formatting second on save, including Auto Save.
`editor.formatOnSave` is disabled because formatting runs through
`source.format.oxc`, avoiding a second formatting pass. Manual Format Document
also uses Oxfmt. Both tools discover their project configuration automatically:
`.oxlintrc.json` for lint and `.oxfmtrc.json` for formatting, including indentation
and line endings. Type-aware linting comes from the root Oxlint configuration.
See the [extension's save-action documentation](https://github.com/oxc-project/oxc-vscode#oxfmt).

`pnpm check` runs format checking, lint, type checking, and the build without
rewriting source files. Build artifacts go to the ignored `dist/` directory.
Browser tests and their `test` script will be added with the plugin; this initial
setup does not yet validate ARIA matching or Chai compatibility. Formatting of
real Lit fixtures will also be checked when the demos are added.
