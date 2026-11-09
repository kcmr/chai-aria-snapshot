# Development instructions

- Make the smallest change that satisfies the request. Preserve unrelated edits;
  avoid incidental refactors, formatting, dependencies, and tooling changes.
- Follow [CONTRIBUTING.md](CONTRIBUTING.md); see [Development](README.md#development)
  for setup. Read [.agent-notes/development.md](.agent-notes/development.md) before
  changing the plugin or tests. Preserve the public API unless the task requires otherwise.
- Use pnpm and Conventional Commits.
- Keep TypeScript strict. Use dependency types rather than recreating them or
  introducing `any`.
- Keep expected YAML inline in tests and await every snapshot assertion.
- Run `pnpm check` before committing. For behavior changes, add a regression test
  and run the browser tests; a build alone is not functional validation.
  For documentation-only changes, check formatting and links.
- Keep public docs focused on durable user and contributor guidance. Put agent
  context in `.agent-notes/` and outstanding work in
  [.agent-notes/TODO.md](.agent-notes/TODO.md). Keep this file brief.
