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
