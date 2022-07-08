export type Callback<K extends string, V extends Value, U> = (
    this: U | undefined,
    value: V,
    key: K,
    store: GMStorage<K, V>
) => void;

export type Options = {
    strict?: boolean;
};

export type Value =
    | null
    | boolean
    | number
    | string
    | Value[]
    | { [key: string]: Value };

// these are defined as globals in @types/tampermonkey
const GM_API_KEYS = ['GM_deleteValue', 'GM_getValue', 'GM_listValues', 'GM_setValue'] as const

const NOT_FOUND = Symbol()
const OPTIONS = { strict: true }

// minification helper
const $global = globalThis

class GMStorage<K extends string = string, V extends Value = Value> implements Map<K, V> {
    constructor (options: Options = OPTIONS) {
        if (!options.strict) {
            return
        }

        for (const key of GM_API_KEYS) {
            const value = $global[key]

            if (!value) {
                throw new ReferenceError(`${key} is not defined`)
            }

            if (typeof value !== 'function') {
                throw new TypeError(`${key} is not a function`)
            }
        }
    }

    private _keys (): K[] {
        return $global.GM_listValues() as K[]
    }

    public clear (): void {
        for (const key of this._keys()) {
            $global.GM_deleteValue(key)
        }
    }

    public delete (key: K): boolean {
        return this.has(key) && ($global.GM_deleteValue(key), true)
    }

    public *entries (): Generator<[K, V]> {
        for (const key of this._keys()) {
            yield [key, this.get(key)!]
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
        return $global.GM_getValue(key, $default)
    }

    public has (key: K): boolean {
        return $global.GM_getValue(key, NOT_FOUND) !== NOT_FOUND
    }

    public *keys (): Generator<K, void, undefined> {
        yield* this._keys()
    }

    public set (key: K, value: V): this {
        $global.GM_setValue(key, value)
        return this
    }

    public setAll (values: Iterable<[K, V]> = []): this {
        for (const [key, value] of values) {
            this.set(key, value)
        }

        return this
    }

    public get size (): number {
        return this._keys().length
    }

    public *values (): Generator<V> {
        for (const key of this._keys()) {
            yield this.get(key)!
        }
    }
}

/* aliases */

interface GMStorage<K extends string = string, V extends Value = Value> extends Map<K, V> {
    [Symbol.iterator]: GMStorage<K, V>['entries'];
}

Object.assign(GMStorage.prototype, {
    [Symbol.iterator]: GMStorage.prototype.entries,
})

export default GMStorage
