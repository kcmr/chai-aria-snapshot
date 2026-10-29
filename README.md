# chai-aria-snapshot

A Chai plugin for checking accessible DOM structure with inline YAML ARIA snapshots.

HTML snapshots change when wrappers or classes change. ARIA snapshots describe
roles, accessible names, states, and semantic hierarchy: an `h2` and a `div` with
`role="heading"` and `aria-level="2"` can satisfy the same expectation.

The project is being bootstrapped. The plugin API is not implemented yet.

## Development

- `pnpm check`: check formatting, lint, types, and build.
- `pnpm build`: generate ESM and TypeScript declarations.
- `pnpm dev`: rebuild the library when sources change.
- `pnpm format`: format source files.
