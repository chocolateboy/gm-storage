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
  - [JSONKeyStore](#jsonkeystore)
    - [Constructor](#constructor-1)
      - [Options](#options-1)
        - [canonical](#canonical)
    - [Methods](#methods)
      - [clear](#clear)
      - [delete](#delete)
      - [entries](#entries)
      - [forEach](#foreach)
      - [get](#get)
      - [has](#has)
      - [keys](#keys)
      - [set](#set)
      - [setAll](#setall)
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
- &lt; 600 B minified + gzipped
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
// @require  https://unpkg.com/gm-storage@4.1.1
// @grant    GM_deleteValue
// @grant    GM_getValue
// @grant    GM_listValues
// @grant    GM_setValue
// ==/UserScript==

const store = new GMStorage()

// now access userscript storage with the ES6 Map API

store.set('alpha', 'beta')                 // store
store.set('foo', 'bar').set('baz', 'quux') // store
store.get('foo')                           // "bar"
store.get('gamma', 'default value')        // "default value"
store.delete('alpha')                      // true
store.size                                 // 2

// iterables
[...store.keys()]         // ["foo", "baz"]
[...store.values()]       // ["bar", "quux"]
Object.fromEntries(store) // { foo: "bar", baz: "quux" }
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
type JSONValue =
    | null
    | boolean
    | number
    | string
    | JSONValue[]
    | { [key: string]: JSONValue };

type Callback<K extends JSONValue, V extends JSONValue, U> = (
    this: U | undefined,
    value: V,
    key: K,
    store: GMStorage<K, V>
) => void;

interface Options {
    strict?: boolean;
};

interface JSONKeyStoreOptions extends Options {
    canonical?: boolean;
};

class GMStorage<K extends string = string, V extends JSONValue = JSONValue> implements Map<K, V> {}
class JSONKeyStore<K extends JSONValue = JSONValue, V extends JSONValue = JSONValue> implements Map<K, V> {}
```

</details>

# EXPORTS

## GMStorage (default)

- **Aliases**: GMStore, GMStorage

### Constructor

- **Type**: `GMStorage<K extends string = string, V extends JSONValue = JSONValue>(options?: Options)`

```javascript
import GMStore from 'gm-storage'

const store = new GMStore()

store.setAll([['foo', 'bar'], ['baz', 'quux']])
store.size // 2
```

Constructs a Map-compatible instance which associates keys with their
corresponding values in the userscript engine's storage. `GMStorage<K, V>`
instances are compatible with `Map<K, V>`, where `K` extends (and defaults to)
string and `V` extends (and defaults to) the type of JSON-serializable values.

#### Options

The `GMStorage` constructor can take the following options:

##### strict

- **Type**: `boolean`
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

## JSONKeyStore

- **Alias**: JSONKeyStorage

### Constructor

- **Type**: `JSONKeyStore<K extends JSONValue = JSONValue, V extends JSONValue = JSONValue>(options?: JSONKeyStoreOptions)`

```javascript
import { JSONKeyStore } from 'gm-storage'

const store = new JSONKeyStore()

store.set(['foo'], 'bar')
store.set({ foo: 'bar' }, ['baz', 'quux'])
store.get(['foo'])        // "bar"
store.get({ foo: 'bar' }) // ["baz", "quux"]
Array.from(store.keys())  // [["foo"], { foo: "bar" }]
```

This class is an extension of the GMStorage class which supports the automatic
conversion of keys to/from JSON. Apart from the options listed below, its
behavior, methods and properties are the same as GMStorage.

#### Options

The `JSONKeyStore` constructor can take the following options, in addition to
those supported by GMStorage:

##### canonical

- **Type**: `boolean`
- **Default**: `true`

```javascript
const store = new JSONKeyStore({ canonical: true })

store.set({ foo: 'bar', baz: 'quux' }, 1)
store.set({ baz: 'quux', foo: 'bar' }, 2)
store.size // 1
store.get({ foo: 'bar', baz: 'quux' }) // 2
store.get({ baz: 'quux', foo: 'bar' }) // 2
```

```javascript
const store = new JSONKeyStore({ canonical: false })

store.set({ foo: 'bar', baz: 'quux' }, 1)
store.set({ baz: 'quux', foo: 'bar' }, 2)
store.size // 2
store.get({ foo: 'bar', baz: 'quux' }) // 1
store.get({ baz: 'quux', foo: 'bar' }) // 2
```

When converting JSON values to strings, JSONKeyStore uses a canonical
representation which ensures that values which contain (nested) objects have
the same JSON representation regardless of their order of construction (by
sorting the keys). This produces the expected results, but may have a
performance impact (e.g. on my system, it's around 6x slower than vanilla
`JSON.stringify`). In cases where this normalization isn't needed — e.g. where
the keys are known to not contain objects (with multiple keys), or where the
order is stable, or significant — it can be disabled by setting this option to
false.

### Methods

#### clear

- **Type**: `clear(): void`
- **Requires**: `GM_deleteValue`, `GM_listValues`

```javascript
const store = new GMStorage().setAll([['foo', 'bar'], ['baz', 'quux']])

store.size    // 2
store.clear()
store.size    // 0
```

Remove all entries from the store.

#### delete

- **Type**: `delete(key: K): boolean`
- **Requires**: `GM_deleteValue`, `GM_getValue`

```javascript
const store = new GMStorage().setAll([['foo', 'bar'], ['baz', 'quux']])

store.size           // 2
store.delete('nope') // false
store.delete('foo')  // true
store.has('foo')     // false
store.size           // 1
```

Delete the value with the specified key from the store. Returns true if the
value existed, false otherwise.

#### entries

- **Type**: `entries(): Generator<[K, V]>`
- **Requires**: `GM_getValue`, `GM_listValues`
- **Alias**: [`Symbol.iterator`](#symboliterator)

```javascript
for (const [key, value] of store.entries()) {
    console.log([key, value])
}
```

Returns an iterable which yields each key/value pair from the store.

#### forEach

- **Type**:
  - `forEach<U>(callback: Callback<K, V, U>, thisArg: U): void`
  - `forEach(callback: Callback<K, V, undefined>): void`
- **Requires**: `GM_getValue`, `GM_listValues`

```javascript
store.forEach((value, key) => {
    console.log([key, value])
})
```

Iterates over each key/value pair in the store, passing them to the callback,
along with the store itself, and binding the optional second argument to `this`
inside the callback.

#### get

- **Type**:
  - `get<D>(key: K, defaultValue: D): V | D`
  - `get(key: K): V | undefined`
- **Requires**: `GM_getValue`

```javascript
const maybeAge = store.get('age')
const age = store.get('age', 42)
```

Returns the value corresponding to the supplied key, or the default value
(which is undefined by default) if it doesn't exist.

#### has

- **Type**: `has(key: K): boolean`
- **Requires**: `GM_getValue`

```javascript
if (!store.has(key)) {
    console.log('not found')
}
```

Returns true if a value with the supplied key exists in the store, false
otherwise.

#### keys

- **Type**: `keys(): Generator<K>`
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

- **Type**: `set(key: K, value: V): this`
- **Requires**: `GM_setValue`

```javascript
store.set('foo', 'bar')
     .set('baz', 'quux')
```

Add a value to the store under the supplied key. Returns the store for
chaining.

#### setAll

- **Type**: `setAll(values?: Iterable<[K, V]>): this`
- **Requires**: `GM_setValue`

```javascript
store.setAll([['foo', 'bar'], ['baz', 'quux']])
store.has('foo') // true
store.get('baz') // "quux"
```

Add entries (key/value pairs) to the store. Returns the store for chaining.

#### values

- **Type**: `values(): Generator<V>`
- **Requires**: `GM_getValue`, `GM_listValues`

```javascript
for (const value of store.values()) {
    console.log(value)
}
```

Returns an iterable collection of the store's values.

### Properties

#### size

- **Type**: `number`
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
- any browser with ES6 support
- the `GM_*` functions are accessed via
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

4.1.1

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2020-2025 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the terms
of the [MIT license](https://opensource.org/licenses/MIT).

[jsDelivr]: https://cdn.jsdelivr.net/npm/gm-storage@4.1.1/dist/index.umd.min.js
[unpkg]: https://unpkg.com/gm-storage@4.1.1/dist/index.umd.min.js
