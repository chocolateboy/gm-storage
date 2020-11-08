# gm-storage

[![Build Status](https://travis-ci.org/chocolateboy/gm-storage.svg)](https://travis-ci.org/chocolateboy/gm-storage)
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
- small (~ 1 KB minified)
- no dependencies
- fully typed (TypeScript)
- UMD builds for convenient userscript use

# INSTALLATION

```
$ npm install gm-storage
```

# USAGE

```javascript
// ==UserScript==
// @name     My Userscript
// @include  https://www.example.com/*
// @require  https://unpkg.com/gm-storage@0.2.0
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
store.keys()                        // ["foo", "baz"]
Array.from(store.values())          // ["bar", "quux"]
Object.fromEntries(store.entries()) // { foo: "bar", baz: "quux" }
```

# DESCRIPTION

GMStorage implements an ES6 Map-compatible wrapper
([adapter](https://en.wikipedia.org/wiki/Adapter_pattern)) for the synchronous
userscript storage API.

It augments the built-in API with some useful enhancements such as iterating
over [values](#values) and [entries](#entries), and [removing all values](#clear).
It also adds some features which aren't available in the Map API, e.g.
[`get`](#get) takes an optional default value (the same as `GM_getValue`).

The synchronous storage API is supported by most userscript engines:

- Greasemonkey 3
- Tampermonkey (closed source)
- [USI](https://addons.mozilla.org/firefox/addon/userunified-script-injector/)
- [Violentmonkey](https://violentmonkey.github.io/)

The notable exceptions are [Greasemonkey 4](https://www.greasespot.net/2017/09/greasemonkey-4-for-script-authors.html),
which has moved exclusively to asynchronous APIs, and FireMonkey,
which doesn't fully support the synchronous storage API.

# TYPES

The following types are referenced in the descriptions below:

<details>

```typescript
type Callback<T, V> = (
    this: T | undefined,
    value: V,
    key: Key,
    store: GMStorage<V>
) => void;

type Key = string;

type Options = {
    strict?: boolean;
}

type Value =
    | undefined
    | null
    | boolean
    | number
    | string
    | Array<Value>
    | { [key: Key]: Value };
```

</details>

# EXPORTS

## GMStorage (default)

### Constructor

**Type**: `GMStorage<V = Value>(options?: Options)`

```javascript
import GMStorage from 'gm-storage'

const store = new GMStorage()

store.set('foo', 'bar')
     .set('baz', 'quux')

console.log(store.size) // 2
```

#### Options

The `GMStorage` constructor optionally takes the following options:

##### strict

**Type**: boolean, default: `true`

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
error is raised.

If the option is false, they are not checked, and access to `GM_*` functions
required by unused storage methods need not be granted.

### Methods

#### clear

**Type**: `clear() ⇒ void`<br />
**Requires**: `GM_deleteValue`, `GM_listValues`

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

**Type**: `delete(key: Key) ⇒ boolean`<br />
**Requires**: `GM_deleteValue`, `GM_getValue`

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

Delete the specified entry from the store. Returns true if the entry existed,
false otherwise.

#### entries

**Type**: `entries() ⇒ Iterable<[Key, V]>`<br />
**Requires**: `GM_getValue`, `GM_listValues`<br />
**Alias**: [`Symbol.iterator`](#symboliterator)

```javascript
for (const [key, value] of store.entries()) {
    console.log([key, value])
}
```

Returns an iterable which yields each key/value pair from the store.

#### forEach

**Type**: `forEach<U>(callback: Callback<U, V>, thisArg?: U) ⇒ void`<br />
**Requires**: `GM_getValue`, `GM_listValues`

```javascript
store.forEach((value, key) => {
    console.log([key, value])
})
```

Iterates over each key/value pair in the store, passing them to the callback,
along with the store itself, and binding the optional second parameter to `this`
inside the callback.

#### get

**Type**: `get<D>(key: Key, defaultValue?: D) ⇒ V | D `<br />
**Requires**: `GM_getValue`<br />

```javascript
const maybeAge = store.get('age')
const age = store.get('age', 42)
```

Returns the value corresponding to the supplied key, or the optional default
value (which is undefined by default) if it doesn't exist.

#### has

**Type**: `has(key: Key) ⇒ boolean`<br />
**Requires**: `GM_getValue`

```javascript
if (!store.has(key)) {
    console.log('not found')
}
```

Returns true if an entry with the supplied key exists in the store, false
otherwise.

#### keys

**Type**: `keys() ⇒ Array<Key>`<br />
**Requires**: `GM_listValues`

```javascript
for (const key of store.keys()) {
    console.log(key)
}
```

Returns the keys from the store as an array.

#### set

**Type**: `set(key: Key, value: V) ⇒ this`<br />
**Requires**: `GM_setValue`

```javascript
store.set('foo', 'bar')
     .set('baz', 'quux')
```

Add a value to the store under the supplied key. Returns `this` (i.e. the
GMStorage instance the method was called on) for chaining.

#### values

**Type**: `values() ⇒ Iterable<V>`<br />
**Requires**: `GM_getValue`, `GM_listValues`

```javascript
for (const value of store.values()) {
    console.log(value)
}
```

Returns an iterable collection of the store's values.

### Properties

#### size

**Type**: `number`<br />
**Requires**: `GM_listValues`

```javascript
console.log(store.size)
```

Returns the number of entries in the store.

#### Symbol.iterator

This is an alias for [`entries`](#entries):

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

- build - compile the library in development mode and save it to the target directory
- build:doc - regenerate this README's TOC
- build:release - compile the library in production mode and save it to the target directory
- clean - remove the target directory and its contents
- rebuild - remove the target directory and build the library in development mode
- test - typecheck the source code and run the test suite
- test:run - run the test suite
- typecheck - typecheck the source code with `tsc`

</details>

# COMPATIBILITY

- any userscript engine with support for the Greasemonkey 3 storage API
- any browser with ES6 support (e.g. symbols and generators)

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

0.2.0

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).
