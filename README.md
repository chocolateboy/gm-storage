# gm-storage

[![Build Status](https://github.com/chocolateboy/gm-storage/workflows/test/badge.svg)](https://github.com/chocolateboy/gm-storage/actions?query=workflow%3Atest)
[![NPM Version](https://img.shields.io/npm/v/gm-storage.svg)](https://www.npmjs.org/package/gm-storage)

<!-- TOC -->

- [NAME](#name)
- [FEATURES](#features)
- [INSTALLATION](#installation)
- [USAGE](#usage)
- [DESCRIPTION](#description)
- [TYPES](#types)
- [EXPORTS](#exports)
  - [GMStorage (default)](#gmstorage-default)
    - [Constructor](#constructor)
      - [Options](#options)
        - [strict](#strict)
    - [Methods](#methods)
      - [clear](#clear)
      - [delete](#delete)
      - [entries](#entries)
      - [forEach](#foreach)
      - [get](#get)
      - [has](#has)
      - [keys](#keys)
      - [set](#set)
      - [values](#values)
    - [Properties](#properties)
      - [size](#size)
      - [Symbol.iterator](#symboliterator)
- [DEVELOPMENT](#development)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
  - [Libraries](#libraries)
  - [APIs](#apis)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- TOC END -->

# NAME

gm-storage - an ES6 Map wrapper for the synchronous userscript storage API

# FEATURES

- implements the full Map API with some helpful extras
- no dependencies
- &lt; 450 B minified + gzipped
- fully typed (TypeScript)
- CDN builds (UMD) - [jsDelivr][], [unpkg][]

# INSTALLATION

```
$ npm install gm-storage
```

# USAGE

```javascript
// ==UserScript==
// @name     My Userscript
// @include  https://www.example.com/*
// @require  https://unpkg.com/gm-storage@1.0.0
// @grant    GM_deleteValue
// @grant    GM_getValue
// @grant    GM_listValues
// @grant    GM_setValue
// ==/UserScript==

const store = new GMStorage()

// now access userscript storage with the ES6 Map API

store.set('foo', 'bar')
     .set('baz', 'quux')

store.set('alpha', 'beta')
store.get('foo')                    // "bar"
store.get('gamma', 'default value') // "default value"
store.delete('alpha')               // true
store.size                          // 2

// iterables
[...store.keys()]                   // ["foo", "baz"]
[...store.values()]                 // ["bar", "quux"]
Object.fromEntries(store.entries()) // { foo: "bar", baz: "quux" }
```

# DESCRIPTION

GMStorage implements an ES6 Map compatible wrapper
([adapter](https://en.wikipedia.org/wiki/Adapter_pattern)) for the synchronous
userscript storage API.

It augments the built-in API with some useful enhancements such as iterating
over [values](#values) and [entries](#entries), and [removing all values](#clear).
It also adds some features which aren't available in the Map API, e.g.
[`get`](#get) takes an optional default value (the same as `GM_getValue`).

The synchronous storage API is supported by most userscript engines:

- [Violentmonkey](https://violentmonkey.github.io/)
- Tampermonkey
- [USI](https://addons.mozilla.org/firefox/addon/userunified-script-injector/)
- Greasemonkey 3

The notable exceptions are [Greasemonkey 4](https://www.greasespot.net/2017/09/greasemonkey-4-for-script-authors.html)
and [FireMonkey](https://github.com/erosman/support/issues/98), which have
moved exclusively to the asynchronous API.

# TYPES

The following types are referenced in the descriptions below:

<details>

```typescript
type Callback<V extends Value, U> = (
    this: (U | undefined),
    value: V,
    key: string,
    store: GMStorage<V>
) => void;

type Options = { strict?: boolean };

type Value =
    | null
    | boolean
    | number
    | string
    | Array<Value>
    | { [key: string]: Value };

class GMStorage<V extends Value = Value> implements Map<string, V> {}
```

</details>

# EXPORTS

## GMStorage (default)

### Constructor

- **Type**: `GMStorage<V extends Value = Value>(options?: Options)`

```javascript
import GMStorage from 'gm-storage'

const store = new GMStorage()

store.set('foo', 'bar')
     .set('baz', 'quux')

console.log(store.size) // 2
```

Constructs a Map-compatible instance which associates strings with values in
the userscript engine's storage. `GMStorage<V>` instances are compatible with
`Map<string, V>`, where `V` extends (or defaults to) the type of
JSON-serializable values.

#### Options

The `GMStorage` constructor can take the following options:

##### strict

- **Type**: boolean
- **Default**: `true`

```javascript
// don't need GM_deleteValue or GM_listValues
const store = new GMStorage({ strict: false })

store.set('foo', 'bar')
store.get('foo') // "bar"
```

In order to use *all* GMStorage methods, the following `GM_*` functions must be
defined (i.e. [granted](https://wiki.greasespot.net/@grant)):

  - `GM_deleteValue`
  - `GM_getValue`
  - `GM_listValues`
  - `GM_setValue`

If this option is true (as it is by default), the existence of these functions
is checked when the store is created. If any of the functions are missing, an
exception is thrown.

If the option is false, they are not checked, and access to `GM_*` functions
required by unused storage methods need not be granted.

### Methods

#### clear

- **Type**: `clear() => void`
- **Requires**: `GM_deleteValue`, `GM_listValues`

```javascript
const store = new GMStorage()
    .set('foo', 'bar')
    .set('baz', 'quux')

store.size    // 2
store.clear()
store.size    // 0
```

Remove all entries from the store.

#### delete

- **Type**: `delete(key: string) => boolean`<br />
- **Requires**: `GM_deleteValue`, `GM_getValue`

```javascript
const store = new GMStorage()
    .set('foo', 'bar')
    .set('baz', 'quux')

store.size           // 2
store.delete('nope') // false
store.delete('foo')  // true
store.size           // 1
store.has('foo')     // false
```

Delete the value with the specified key from the store. Returns true if the
value existed, false otherwise.

#### entries

- **Type**: `entries() => IterableIterator<[string, V]>`<br />
- **Requires**: `GM_getValue`, `GM_listValues`<br />
- **Alias**: [`Symbol.iterator`](#symboliterator)

```javascript
for (const [key, value] of store.entries()) {
    console.log([key, value])
}
```

Returns an iterable which yields each key/value pair from the store.

#### forEach

- **Type**: `forEach<U>(callback: Callback<V, U>, thisArg?: U) => void`<br />
- **Requires**: `GM_getValue`, `GM_listValues`

```javascript
store.forEach((value, key) => {
    console.log([key, value])
})
```

Iterates over each key/value pair in the store, passing them to the callback,
along with the store itself, and binding the optional second parameter to `this`
inside the callback.

#### get

- **Type**: `get<D>(key: string, defaultValue?: D) => V | D | undefined `<br />
- **Requires**: `GM_getValue`<br />

```javascript
const maybeAge = store.get('age')
const age = store.get('age', 42)
```

Returns the value corresponding to the supplied key, or the default value
(which is undefined by default) if it doesn't exist.

#### has

- **Type**: `has(key: string) => boolean`<br />
- **Requires**: `GM_getValue`

```javascript
if (!store.has(key)) {
    console.log('not found')
}
```

Returns true if a value with the supplied key exists in the store, false
otherwise.

#### keys

- **Type**: `keys() => IterableIterator<string>`<br />
- **Requires**: `GM_listValues`

```javascript
for (const key of store.keys()) {
    console.log(key)
}
```

Returns an iterable collection of the store's keys.

Note that, for compatibility with `Map#keys`, the return value is iterable but
is *not* an array.

#### set

- **Type**: `set(key: string, value: V) => this`<br />
- **Requires**: `GM_setValue`

```javascript
store.set('foo', 'bar')
     .set('baz', 'quux')
```

Add a value to the store under the supplied key. Returns `this` (i.e. the
GMStorage instance the method was called on) for chaining.

#### values

- **Type**: `values() => IterableIterator<V>`<br />
- **Requires**: `GM_getValue`, `GM_listValues`

```javascript
for (const value of store.values()) {
    console.log(value)
}
```

Returns an iterable collection of the store's values.

### Properties

#### size

- **Type**: `number`<br />
- **Requires**: `GM_listValues`

```javascript
console.log(store.size)
```

Returns the number of values in the store.

#### Symbol.iterator

An alias for [`entries`](#entries):

```javascript
for (const [key, value] of store) {
    console.log([key, value])
}
```

# DEVELOPMENT

<details>

<!-- TOC:ignore -->
## NPM Scripts

The following NPM scripts are available:

- build - compile the library for testing and save to the target directory
- build:doc - generate the README's TOC (table of contents)
- build:release - compile the library for release and save to the target directory
- clean - remove the target directory and its contents
- rebuild - clean the target directory and recompile the library
- test - recompile the library and run the test suite
- test:run - run the test suite
- typecheck - sanity check the library's type definitions

</details>

# COMPATIBILITY

- any userscript engine with support for the Greasemonkey 3 storage API
- any browser with ES6 support (e.g. symbols and generators)
- the `GM_*` methods are accessed via
  [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis),
  which may need to be polyfilled in older browsers

# SEE ALSO

## Libraries

- [Keyv](https://www.npmjs.com/package/keyv) - simple key-value storage with support for multiple backends

## APIs

- [GM_deleteValue](https://sourceforge.net/p/greasemonkey/wiki/GM_deleteValue/)
- [GM_getValue](https://sourceforge.net/p/greasemonkey/wiki/GM_getValue/)
- [GM_listValues](https://sourceforge.net/p/greasemonkey/wiki/GM_listValues/)
- [GM_setValue](https://sourceforge.net/p/greasemonkey/wiki/GM_setValue/)
- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

# VERSION

1.0.0

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2020-2021 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the terms
of the [MIT license](https://opensource.org/licenses/MIT).

[jsDelivr]: https://cdn.jsdelivr.net/npm/gm-storage@1.0.0/dist/index.umd.min.js
[unpkg]: https://unpkg.com/gm-storage@1.0.0/dist/index.umd.min.js
