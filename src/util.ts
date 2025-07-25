type PlainObject = Record<string, JSONValue>;

export type JSONValue =
    | null
    | boolean
    | number
    | string
    | JSONValue[]
    | { [key: string]: JSONValue };

export const identity = <T>(value: T): T => value

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

export const { parse } = JSON as {
    parse <K extends JSONValue>(key: string): K;
}

export const stringify = <K extends JSONValue>(value: K): string => JSON.stringify(value, canonicalize)
