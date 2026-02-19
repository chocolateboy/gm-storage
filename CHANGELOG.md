## 5.1.0 - TBD

### Features

- `remove` returns the store for chaining (rather than void)

    before:

    ```javascript
    store.remove('foo')
    store.remove('bar')
    ```

    after:

    ```javascript
    store.remove('foo').remove('bar')
    ```

- add `removeAll` to remove multiple keys in one go

    before:

    ```javascript
    store.remove('foo')
    store.remove('bar')
    ```

    after:

    ```javascript
    store.removeAll(['foo', 'bar'])
    ```

## 5.0.0 - 2026-02-18

### Breaking changes

- Replace JSONKeyStore with a new class/export, GMStoreBy, which takes a key
  translator (parse/stringify functions), leaving the implementation up to the
  user, e.g.:

    before:

    ```javascript
    import { JSONKeyStorage } from 'gm-storage'

    const store = new JSONKeyStorage({ canonicalize: true })
    store.set({ foo: 42, bar: true }, 1)
    store.has({ bar: true, foo: 42 }) // true
    ```

    after:

    ```javascript
    import { GMStoreBy }                  from 'gm-storage'
    import { stringifyCopy as stringify } from 'canonical-json'

    const store = new GMStoreBy({ key: { parse: JSON.parse, stringify } })
    store.set({ foo: 42, bar: true }, 1)
    store.has({ bar: true, foo: 42 }) // true
    ```

### Features

- add ES2026 [`getOrInsert`][getOrInsert] and [`getOrInsertComputed`][getOrInsertComputed] methods
- add a `remove` method, which directly calls `GM_deleteValue` without checking
  if the value exists

### Changes

- bump dependencies
- update build

## 4.1.1 - 2025-08-15

- documentation fix

## 4.1.0 - 2025-07-27

- add a `canonical` option to JSONKeyStore to allow normalization (i.e. sorting
  object keys) to be disabled.

## 4.0.1 - 2025-07-26

- add missing UMD builds

## 4.0.0 - 2025-07-26

### Breaking changes

- restore string keys for the default GMStorage export, and add the JSON-key
  variant (JSONKeyStorage) as a separate export:

    ```javascript
    import GMStorage from 'gm-storage'
    import { JSONKeyStorage } from 'gm-storage'

    const stringKeyStore = new GMStorage()
    const jsonKeyStore = new JSONKeyStorage()
    ```

    this is a breaking change (again) as the extra export means an unnamed export
    can no longer be used in CommonJS, i.e. `require`s which could previously be
    written as:

    ```javascript
    const GMStore = require('gm-storage')
    ```

    now need to specify the name, e.g.:

    ```javascript
    const GMStorage = require('gm-storage').default
    const { GMStorage } = require('gm-storage')
    ```

## 3.0.0 - 2025-07-25

### Breaking changes

#### Features

- keys are stored and retrieved as JSON values rather than strings:

    before:

    ```javascript
    store.set(JSON.stringify(['foo']), 'bar')
    store.get(JSON.stringify(['foo'])) // "bar"
    ```

    after:

    ```javascript
    store.set(['foo'], "bar")
    store.get(['foo']) // "bar"
    ```

#### Types

- rename JSON type: Value -> JSONValue

### Fixes

- fix Map compatibility under `exactOptionalPropertyTypes`

## 2.0.3 - 2022-07-09

- docfix

## 2.0.2 - 2022-07-09

- docfix

## 2.0.1 - 2022-07-09

- docfix

## 2.0.0 - 2022-07-09

### Breaking changes

#### Types

- change the type signature from `GMStorage<V extends Value = Value>` to
  `GMStorage<K extends string = string, V extends Value = Value>` for parity
  with `Map<K, V>`

#### Features

- add a `setAll` method to assign multiple key/value pairs in one go

#### Changes

- bump dev dependencies
- update the build
- test cleanup

## 1.1.0 - 2021-05-28

- use [package.exports](https://nodejs.org/api/packages.html#packages_package_entry_points)
  to declare entries

## 1.0.1 - 2021-05-26

- improve documentation
- test cleanup

## 1.0.0 - 2021-05-24

### Breaking Changes

#### Types

- compatibility with `Map<string, V>`
  - `GMStorage#keys` returns an iterable/iterator rather than an array
  - fix the type for stored values (JSON-serializable)
- remove the `Key` alias for `string`

### Changes

- relicense: Artistic 2.0 -> MIT
- add test for options.strict
- docs: update compatibility notice

## 0.2.0 - 2020-05-16

- **breaking change**: rename options.check -> options.strict

## 0.1.1 - 2020-05-13

- improve documentation

## 0.1.0 - 2020-05-12

- **breaking change**: rename options.verify -> options.check
- test improvements

## 0.0.1 - 2020-05-11

- initial release

[getOrInsert]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert
[getOrInsertComputed]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed
