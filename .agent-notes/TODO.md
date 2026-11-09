# Pending work

## Continuous integration

- [x] Add GitHub Actions PR checks for `pnpm check`, using the Playwright image
      with Chromium, Firefox, WebKit, and system dependencies preinstalled.
      Reference the workflow from CONTRIBUTING.md.
- [x] Verify the first GitHub Actions run on a PR.
- [x] Configure Lefthook: run `pnpm check` before push, and typecheck, lint,
      and format before commit. Ensure built declarations exist for typecheck.
- [x] Add a commit-message hook to validate Conventional Commits, then document
      its setup and behavior in CONTRIBUTING.md.

## Releases

- [x] Integrate semantic-release with GitHub Actions for automated versioning,
      tags without `v`, a committed CHANGELOG, and npm publication via OIDC.
- [x] Remove `private: true` and complete package metadata for publication.
- [x] Publish 1.0.0, configure its npm trusted publisher, and verify GitHub push
      permissions. The first CI attempt successfully exchanged the OIDC token.
- [ ] Recover the interrupted 1.0.1 publication: the remote release commit and
      tag exist, but npm publication failed with ENEEDAUTH using npm 10.9.9.
      The release job now installs npm 11 explicitly, since pnpm's dependency
      layout did not expose the plugin's bundled npm to the publish subprocess.
- [ ] Verify the first automated release after npm publishing setup is complete.
- [ ] Verify release App authentication with protected `main`, including the
      generated commit and version-tag creation. External App credentials and
      ruleset configuration are not yet confirmed.

## Completed baseline

- [x] Test through public package exports in Chromium, Firefox, and WebKit,
      including open Shadow DOM, slots, retries, negation, and assertion diffs.
- [x] Cover Chai 6.3.0 directly and open-wc's ESM bundle of Chai 4.3.4,
      including use of the consumer's AssertionError. This coverage is accepted
      for publication without a separate version matrix.
- [x] Add compile-only public API checks in `test/types/public-types.ts`.
      These share the test TypeScript program rather than isolated consumers.
