import { GMStorageBase, OPTIONS as BASE_OPTIONS, type JSONValue, type Options } from './gm-storage-base.js'

type PlainObject = Record<string, JSONValue>;

export interface JSONKeyStoreOptions extends Options {
    canonical?: boolean;
}

const OPTIONS = { ...BASE_OPTIONS, canonical: true }

const toString = {}.toString

const isPlainObject = <T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>>(value: unknown): value is T => {
    return (toString.call(value) === '[object Object]')
        && (((value as {}).constructor || Object) === Object)
}

const canonicalize = (_key: string, value: JSONValue) => {
    if (isPlainObject(value)) {
        const keys = Object.keys(value).sort()
        const sorted: PlainObject = {}

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i]
            sorted[key] = value[key]
        }

        return sorted
    } else {
        return value
    }
}

const { parse } = JSON as {
    parse <K extends JSONValue>(key: string): K;
}

export const stringify = <K extends JSONValue>(value: K): string => JSON.stringify(value, canonicalize)

export class JSONKeyStore<K extends JSONValue = JSONValue, V extends JSONValue = JSONValue> extends GMStorageBase<K, V> {
    protected stringify: (value: K) => string;

    constructor (options: JSONKeyStoreOptions = OPTIONS) {
        super(options)
        this.stringify = options.canonical ? stringify : JSON.stringify
    }

    protected parse = parse as (value: string) => K;
}
