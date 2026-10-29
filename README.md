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
