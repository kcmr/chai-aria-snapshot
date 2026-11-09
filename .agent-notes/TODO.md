# Pending work

## Continuous integration

- [ ] Add GitHub Actions PR checks for `pnpm check`, installing Chromium,
      Firefox, WebKit, and their system dependencies. Update CONTRIBUTING.md
      to reference the available checks once configured.
- [ ] Add a commit-message hook to validate Conventional Commits, then document
      its setup and behavior in CONTRIBUTING.md.

## Releases

- [ ] Integrate semantic-release with GitHub Actions for automated versioning
      and releases.
- [ ] Remove `private: true` from package.json before publishing the package.

## Chai compatibility matrix

- [ ] Validate the declared `^4.3.4 || ^6.3.0` peer range before publication.
      Current coverage exercises Chai 6.3.0 directly and open-wc's ESM bundle of
      Chai 4.3.4, rather than a full version matrix.
- [ ] Run a small shared compatibility suite against the minimum and latest
      available versions of each supported major, deduplicating identical versions.
      Cover registration, asynchronous return values, negation, retries, and the
      consumer's AssertionError with diff properties. Keep YAML visible in the tests.
- [ ] Compile isolated consumers with their Chai type dependencies to check
      declaration merging and the public Promise return type. Multiple global Chai
      definitions in the main test project can mask consumer type incompatibilities.
- [ ] Account for the original Chai 4 package's CommonJS/browser loading rather
      than relying only on open-wc's repackaged ESM build.

Keep version selection and loading in test tooling. Start the compatibility
matrix in Chromium and retain the existing cross-browser ARIA behavior suite;
do not introduce version branches or adapters into the plugin preemptively.

Chai 5 remains outside the peer range. Adding it is a separate support decision.

## Completed baseline

- [x] Test through public package exports in Chromium, Firefox, and WebKit,
      including open Shadow DOM, slots, retries, negation, and assertion diffs.
- [x] Cover Chai 6.3.0 directly and open-wc's ESM bundle of Chai 4.3.4,
      including use of the consumer's AssertionError. The version matrix above
      remains pending.
- [x] Add compile-only public API checks in `test/types/public-types.ts`.
      Isolated consumer type checks remain pending.
