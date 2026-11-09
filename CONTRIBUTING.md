# Contributing

Contributions are welcome, including bug reports, documentation improvements,
bug fixes, and new features.

For local setup and development commands, see
[Development in the README](README.md#development).

## Reporting bugs and suggesting features

Before opening an issue, please check whether it has already been reported.
For bugs, include steps to reproduce the problem, the expected behavior,
and the relevant package and browser versions. A minimal reproduction is
especially helpful.

For larger features or changes to the public API, consider opening an issue
first to discuss the approach.

## Pull requests

Keep each pull request focused on a single change and describe the problem
it addresses. Link any related issues and include tests or documentation
updates where appropriate.

Please preserve compatibility with the existing public API where possible.
If a breaking change is necessary, explain its impact and how users would
adapt their code.

## Commit messages

This repository uses [Conventional Commits](https://www.conventionalcommits.org/).

## Before submitting

- Add regression tests for bug fixes and tests for new behavior.
- Update documentation when public behavior changes.
- Run `pnpm check` to verify formatting, browser tests, lint, and types.
- Include any relevant testing notes in the PR description.

Automated checks should pass before merging. If you have trouble running
a check, mention it in the PR.
