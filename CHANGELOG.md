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

### Features

- add a `setAll` method to assign multiple key/value pairs in one go

### Changes

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
