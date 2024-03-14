# lum.dom.js

A small set of DOM helpers wrapped in a minimalist core.

## DEPRECATION NOTICE

I think I over-engineered this library set to be too complicated.
For the vast majority of browser-side code this was overkill and forced
specific usage patterns.

As such, I am working on a set of replacement libraries, starting with a
fundamental `web-core` that runs natively in a browser environment.
This new library allows a much wider variety of usage patterns, 
making almost all features modular so you can pick which bits you want to 
use and ignore the rest. As it is written to run directly in a browser,
it doesn't integrate as smoothly with `jsdom` as this did, however I plan
to make a couple different extension libraries to provide `jsdom` support in
a couple different ways.

Once the minimalist core and a few extensions are released, I plan to write 
a new `web-tests` library that will either replace or supplement the 
`tests-dom` package that used this library as its core.

Then this library (and the version of `tests-dom` depending on it) will be
retired from active development. It had a short life, but a lot of it will
live on in `web-core` and its upcoming extensions.

## Features

- Wraps a `window` object so it works in browser or Node.js with `jsdom`.
- Has a bunch of simple type tests.
- Simple method wrappers for common functionality:
  - `dom.elem()` → `document.createElement()`
  - `dom.frag()` → `document.createDocumentFragment()`
  - `dom.parse()` → `(new DOMParser()).parseFromString()`
  - `dom.html()` → Use `dom.parse()` forcing HTML, and return the element(s).
    Can optionally run `dom.extend()` on the returned value automatically.
  - `dom.xml()` → Use `dom.parse()` forcing XML, and return the document 
    element. Can optionally run `dom.extend()` automatically.
- A `Query` library which extends `querySelector` and `querySelectorAll`.
  - Use `dom.query` for access to a default library instance.
  - Has a `dom.find()` shortcut method to find multiple nodes.
    Can *optionally* return an `HTMLCollection` instead of a `NodeList`.
  - Has a `dom.get()` shortcut method to find a single node.
  - With `dom.options.extendQueries` set to `true`, results from
    either of the shortcut methods use `dom.extend()` automatically.
- An `Events` library to make working with event handlers easier.
  - Supports building delegated event handlers automatically.
  - Use `dom.events` for access to a default library instance.
  - Has `dom.on(), dom.off(), dom.trigger()` shortcut methods.
- An `Extender` library to add additional methods and accessor properties 
  to `Node`, `NodeList`, or `HTMLCollection` object instances.
  - Use `dom.extender` for access to a default library instance.
  - Has a `dom.extend()` shortcut method.
- A `ListCompiler` library for building `NodeList` and `HTMLCollection`
  objects, which normally cannot be constructed manually.
  - Use `dom.listCompiler` for access to a default library instance.
  - Used by the `Query` library to build composite lists, and to
    convert `NodeList` results into `HTMLCollection` results when asked to.
  - Can be easily extended to add other DOM objects without constructors. 

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.dom.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/dom)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)
