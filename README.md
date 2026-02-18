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
  - [GMStore (default)](#gmstore)
    - [Options](#options)
      - [strict](#strict)
    - [Methods](#methods)
      - [clear](#clear)
      - [delete](#delete)
      - [entries](#entries)
      - [forEach](#foreach)
      - [get](#get)
      - [getOrInsert](#getorinsert)
      - [getOrInsertComputed](#getorinsertcomputed)
      - [has](#has)
      - [keys](#keys)
      - [remove](#remove)
      - [set](#set)
      - [setAll](#setall)
      - [values](#values)
      - [Symbol.iterator](#symboliterator)
    - [Properties](#properties)
      - [size](#size)
  - [GMStoreBy](#gmstoreby)
    - [Options](#gmstoreby-options)
      - [key](#key)
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
- support for automatic key translation (e.g. to/from JSON)
- no dependencies
- ~1.3 KB minified (~600 B minified + gzipped)
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
// @require  https://unpkg.com/gm-storage@5.0.0
// @grant    GM_deleteValue
// @grant    GM_getValue
// @grant    GM_listValues
// @grant    GM_setValue
// ==/UserScript==

const store = new GMStore()

// now access userscript storage with the ES6 Map API

store.set('alpha', 'beta')                 // store
store.set('foo', 'bar').set('baz', 'quux') // store
store.get('foo')                           // "bar"
store.get('gamma', 'default value')        // "default value"
store.delete('alpha')                      // true
store.size                                 // 2

// iterables
store.keys().toArray()    // ["foo", "baz"]
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

The following types are exported and referenced in the descriptions below:

<details>

```typescript
type JSONValue =
    | null
    | boolean
    | number
    | string
    | JSONValue[]
    | { [key: string]: JSONValue };

type Callback<Store extends Map<K, V>, K, V extends JSONValue, This> = (
    this: This,
    value: V,
    key: K,
    store: Store
) => void;

type Key<K> {
    parse: (value: string) => K;
    stringify: (key: K) => string;
}

interface Options {
    strict?: boolean;
}

interface GMStoreByOptions<K> extends Options {
    key: Key<K>;
}
```

</details>

# EXPORTS

<a name="gmstore"></a>
## GMStore (default)

- **Type**: `new GMStore<K extends string = string, V extends JSONValue = JSONValue>(options?: Options)`
- **Aliases**: default, GMStorage

```javascript
import GMStore from 'gm-storage'

const store = new GMStore()

store.setAll([['foo', 'bar'], ['baz', 'quux']])
store.size // 2
```

Constructs a Map-compatible instance which associates keys with their
corresponding values in the userscript engine's storage. `GMStore<K, V>`
instances are compatible with `Map<K, V>`, where `K` extends and defaults to
string and `V` extends and defaults to the type of JSON-serializable values.

Non-string (e.g. JSON-serializable) keys can be used via
[GMStoreBy](#gmstoreby), which supports a converter ([`key`](#key)) which
transparently translates the key type to/from strings.

### Options

The `GMStore` constructor can take the following options:

#### strict

- **Type**: `boolean`
- **Default**: `true`

```javascript
// don't need GM_deleteValue or GM_listValues
const store = new GMStore({ strict: false })

store.set('foo', 'bar')
store.get('foo') // "bar"
```

In order to use *all* GMStore methods, the following `GM_*` functions must be
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

- **Type**: `clear(): void`
- **Requires**: `GM_deleteValue`, `GM_listValues`

```javascript
const store = new GMStore().setAll([['foo', 'bar'], ['baz', 'quux']])

store.size    // 2
store.clear()
store.size    // 0
```

Remove all entries from the store.

#### delete

- **Type**: `delete(key: K): boolean`
- **Requires**: `GM_deleteValue`, `GM_getValue`

```javascript
const store = new GMStore().setAll([['foo', 'bar'], ['baz', 'quux']])

store.size           // 2
store.delete('nope') // false
store.delete('foo')  // true
store.has('foo')     // false
store.size           // 1
```

Delete the value with the specified key from the store. Returns true if the
value existed, false otherwise.

#### entries

- **Type**: `entries(): MapIterator<[K, V]>`
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
  - `forEach<U>(callback: Callback<this, K, V, U>, thisArg: U): void`
  - `forEach(callback: Callback<this, K, V, undefined>): void`
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

#### getOrInsert

- **Type**: `getOrInsert(key: K, defaultValue: V): V`
- **Requires**: `GM_getValue`, `GM_setValue`

```javascript
store.get('age')             // undefined
store.getOrInsert('age', 42) // 42
store.get('age')             // 42
```

Returns the value corresponding to the supplied key, or sets and returns the
supplied value if it doesn't exist.

#### getOrInsertComputed

- **Type**: `getOrInsertComputed(key: K, callback: (key: K) => V): V`
- **Requires**: `GM_getValue`, `GM_setValue`

```javascript
store.get('age')                                      // undefined
store.getOrInsertComputed('age', () => 42)            // 42
store.get('age')                                      // 42

store.get('value')                                    // undefined
store.getOrInsertComputed('value', key => key.length) // 5
store.get('value')                                    // 5
```

Returns the value corresponding to the supplied key, or sets and returns the
value returned by the supplied callback if it doesn't exist.

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

- **Type**: `keys(): MapIterator<K>`
- **Requires**: `GM_listValues`

```javascript
for (const key of store.keys()) {
    console.log(key)
}
```

Returns an iterable collection of the store's keys.

Note that, for compatibility with `Map#keys`, the return value is iterable but
is *not* an array.

#### remove

- **Type**: `remove(key: K): void`
- **Requires**: `GM_deleteValue`

```javascript
const store = new GMStore().setAll([['foo', 'bar'], ['baz', 'quux']])

store.size          // 2
store.has('foo')    // true
store.remove('foo') // undefined
store.has('foo')    // false
store.size          // 1
```

Delete the value with the specified key from the store.

This performs the same operation as [`delete`](#delete), but without the extra
step of determining whether the value exists.

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

- **Type**: `values(): MapIterator<V>`
- **Requires**: `GM_getValue`, `GM_listValues`

```javascript
for (const value of store.values()) {
    console.log(value)
}
```

Returns an iterable collection of the store's values.

#### Symbol.iterator

An alias for [`entries`](#entries):

```javascript
for (const [key, value] of store) {
    console.log([key, value])
}
```

### Properties

#### size

- **Type**: `number`
- **Requires**: `GM_listValues`

```javascript
console.log(store.size)
```

Returns the number of values in the store.

## GMStoreBy

- **Type**: `new GMStoreBy<K, V extends JSONValue = JSONValue>(options: GMStoreByOptions<K>)`

A custom version of [GMStore](#gmstore) which supports non-string keys by
transparently translating them to/from strings via a pair of `parse` and
`stringify` functions. Apart from the unrestricted key type, its [methods](#methods)
and [properties](#properties) are the same as those of GMStore.

<a name="gmstoreby-options"></a>
### Options

The GMStoreBy constructor takes the same [options](#options) as GMStore, along with the
following (required) option:

#### key

- **Type**: `Key<K>`, required

```javascript
import { GMStoreBy, type JSONValue } from 'gm-storage'

const store = new GMStoreBy<JSONValue>({ key: JSON })

store.set(['foo'], 'bar')
store.set({ foo: 'bar' }, ['baz', 'quux'])
store.get(['foo'])        // "bar"
store.get({ foo: 'bar' }) // ["baz", "quux"]
store.keys().toArray()    // [["foo"], { foo: "bar" }]
```

The `key` option is an object which provides an encoder (`stringify`) and
decoder (`parse`) function to translate keys to/from strings for use in
the underlying storage.

For example, to serialize keys to canonical JSON (so that e.g. `[{ foo: 42, bar: true }]`
and `[{ bar: true, foo: 42 }]` are mapped to the same value):

```typescript
import { GMStoreBy, type JSONValue }  from 'gm-storage'
import { stringifyCopy as stringify } from 'canonical-json'

const store = new GMStoreBy<JSONValue>({
    key: { parse: JSON.parse, stringify }
})

store.set({ foo: 42, bar: true }, 1)
store.has({ foo: 42, bar: true }) // true
store.has({ bar: true, foo: 42 }) // true
```

Any serializer/deserializer can be used (not just JSON), e.g. to support bigint
keys:

```typescript
import { GMStoreBy } from 'gm-storage'

const store = new GMStoreBy<bigint, boolean>({
    key: { parse: BigInt, stringify: String }
})

store.set(42n, true)
store.keys().toArray() // [42n]
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

5.0.0

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2020-2025 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the terms
of the [MIT license](https://opensource.org/licenses/MIT).

[jsDelivr]: https://cdn.jsdelivr.net/npm/gm-storage@5.0.0/dist/index.umd.min.js
[unpkg]: https://unpkg.com/gm-storage@5.0.0/dist/index.umd.min.js
