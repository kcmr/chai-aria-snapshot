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
With nvm installed:

```sh
nvm use
corepack pnpm install --frozen-lockfile
```

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
