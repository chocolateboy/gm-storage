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
