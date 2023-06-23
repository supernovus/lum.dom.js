# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2023-06-09
### Added
- `dom#whenReady(cb)` for `document:DOMContentLoaded` events.
- `dom#whenWindowReady(cb)` for `window:load` events.
- `dom#ready` accessor returns Promise for `whenReady()`.
- `dom#windowReady` accessor returns Promise for `whenWindowReady()`.
### Changed
- Enhanced documentation in `events` and `events.Plugin` modules.

## [1.3.1] - 2023-06-05
### Fixed
- Two copy-n-paste typo bugs in `extend.js`

## [1.3.0] - 2023-05-29
### Added
- New plugin support for `events` sub-module.

## [1.2.1] - 2023-01-19
### Changed
- Using `@lumjs/tests` for `npm test` now.

## [1.2.0] - 2022-10-19
### Added
- A new `mode` parameter to the `dom.html()` method.
  This parameter allows for more flexibility in the return type.
- A new `util.HTML_MODE` enum for the new parameter.
- Added tests for the new parameter.
- Added static aliases to `NODE_TYPE`, `PARSE_TYPE`, and `HTML_MODE` to
  the `Dom` class itself. No need to import `util` anymore.

## [1.1.0] - 2022-09-21
### Changed
- If `window` parameter in the constructor is `undefined` or `null`,
  but the `core.context.isWindow` is true, we use the global `window`.

## [1.0.0] - 2022-09-02
### Added
- Initial release.

[Unreleased]: https://github.com/supernovus/lum.dom.js/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/supernovus/lum.dom.js/compare/v1.3.0...v1.3.1
[1.3.1]: https://github.com/supernovus/lum.dom.js/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/supernovus/lum.dom.js/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/supernovus/lum.dom.js/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/supernovus/lum.dom.js/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/supernovus/lum.dom.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.dom.js/releases/tag/v1.0.0

