export type JSONValue =
    | null
    | boolean
    | number
    | string
    | JSONValue[]
    | { [key: string]: JSONValue };

export type Callback<K extends JSONValue, V extends JSONValue, U> = (
    this: U | undefined,
    value: V,
    key: K,
    store: GMStorageBase<K, V>
) => void;

export interface Options {
    strict?: boolean;
};

// these are defined as globals in @types/tampermonkey
const GM_API_KEYS = ['GM_deleteValue', 'GM_getValue', 'GM_listValues', 'GM_setValue'] as const
const NOT_FOUND = Symbol()

export const OPTIONS = { strict: true }

abstract class GMStorageBase<K extends JSONValue = JSONValue, V extends JSONValue = JSONValue> implements Map<K, V> {
    constructor (options: Options = OPTIONS) {
        if (!options.strict) {
            return
        }

        for (const key of GM_API_KEYS) {
            const value = globalThis[key]

            if (!value) {
                throw new ReferenceError(`${key} is not defined`)
            }

            if (typeof value !== 'function') {
                throw new TypeError(`${key} is not a function`)
            }
        }
    }

    protected abstract parse: (value: string) => K;
    protected abstract stringify: (value: K) => string;

    private _has (key: string): boolean {
        return GM_getValue(key, NOT_FOUND) !== NOT_FOUND
    }

    public clear (): void {
        const keys = GM_listValues()

        for (let i = 0; i < keys.length; ++i) {
            GM_deleteValue(keys[i])
        }
    }

    public delete (key: K): boolean {
        const $key = this.stringify(key)
        return this._has($key) && (GM_deleteValue($key), true)
    }

    public *entries (): Generator<[K, V]> {
        const keys = GM_listValues()

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i]
            yield [this.parse(key), GM_getValue(key)!]
        }
    }

    // "The length property of the forEach method is 1."
    // https://www.ecma-international.org/ecma-262/6.0/#sec-map.prototype.foreach
    public forEach <U>(callback: Callback<K, V, U>, $this: U): void
    public forEach (callback: Callback<K, V, undefined>): void
    public forEach (callback: Callback<K, V, unknown>, $this = undefined): void {
        for (const [key, value] of this.entries()) {
            callback.call($this, value, key, this)
        }
    }

    public get (key: K): V | undefined
    public get <D>(key: K, $default: D): V | D
    public get (key: K, $default = undefined) {
        return GM_getValue(this.stringify(key), $default)
    }

    public has (key: K): boolean {
        return this._has(this.stringify(key))
    }

    public *keys (): Generator<K> {
        const keys = GM_listValues()

        for (let i = 0; i < keys.length; ++i) {
            yield this.parse(keys[i])
        }
    }

    public set (key: K, value: V): this {
        GM_setValue(this.stringify(key), value)
        return this
    }

    public setAll (values: Iterable<[K, V]> = []): this {
        for (const [key, value] of values) {
            this.set(key, value)
        }

        return this
    }

    public get size (): number {
        return GM_listValues().length
    }

    public *values (): Generator<V> {
        const keys = GM_listValues()

        for (let i = 0; i < keys.length; ++i) {
            yield GM_getValue(keys[i])!
        }
    }
}

/* aliases */

interface GMStorageBase<K extends JSONValue = JSONValue, V extends JSONValue = JSONValue> extends Map<K, V> {
    [Symbol.iterator]: GMStorageBase<K, V>['entries'];
}

Object.assign(GMStorageBase.prototype, {
    [Symbol.iterator]: GMStorageBase.prototype.entries,
})

export { GMStorageBase }
