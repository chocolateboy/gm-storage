export interface Options {
    strict?: boolean;
}

export type JSONValue =
    | null
    | boolean
    | number
    | string
    | JSONValue[]
    | { [key: string]: JSONValue };

export type Callback<Store extends BaseGMStore<K, V>, K, V extends JSONValue, This> = (
    this: This,
    value: V,
    key: K,
    store: Store
) => void;

// these are defined as globals in @types/tampermonkey
const GM_API_KEYS = ['GM_deleteValue', 'GM_getValue', 'GM_listValues', 'GM_setValue'] as const

const OPTIONS: Options = { strict: true }

export const checkFunction = (name: string, value: unknown) => {
    if (value === undefined) {
        throw new ReferenceError(`${name} is not defined`)
    } else if (typeof value !== 'function') {
        throw new TypeError(`${name} is not a function`)
    }
}

abstract class BaseGMStore<K, V extends JSONValue = JSONValue> implements Map<K, V> {
    constructor(options: Options = OPTIONS) {
        if (options.strict !== false) {
            for (const name of GM_API_KEYS) {
                checkFunction(name, globalThis[name])
            }
        }
    }

    public get [Symbol.toStringTag](): string {
        return 'GMStore'
    }

    public clear(): void {
        const keys = GM_listValues()

        for (let i = 0; i < keys.length; ++i) {
            GM_deleteValue(keys[i])
        }
    }

    public delete(key: K): boolean {
        return this.has(key) && (this.remove(key), true)
    }

    public abstract entries(): MapIterator<[K, V]>;

    public forEach<This>(callback: Callback<this, K, V, This>, $this: This): void
    public forEach(callback: Callback<this, K, V, undefined>): void
    public forEach(callback: Callback<this, K, V, unknown>, $this = undefined): void {
        for (const [key, value] of this.entries()) {
            callback.call($this, value, key, this)
        }
    }

    public abstract get(key: K): V | undefined;
    public abstract get<D>(key: K, defaultValue: D): V | D;

    public getOrInsert(key: K, defaultValue: V): V {
        return this.getOrInsertComputed(key, () => defaultValue)
    }

    public getOrInsertComputed(key: K, callback: (key: K) => V): V {
        let value: V

        if (this.has(key)) {
            value = this.get(key)!
        } else {
            value = callback(key)
            this.set(key, value)
        }

        return value
    }

    public abstract has(key: K): boolean;

    public abstract keys(): MapIterator<K>;

    public abstract remove(key: K): this;

    public removeAll(keys: Iterable<K> = []): this {
        for (const key of keys) {
            this.remove(key)
        }

        return this
    }

    public abstract set(key: K, value: V): this;

    public setAll(entries: Iterable<[K, V]> = []): this {
        for (const [key, value] of entries) {
            this.set(key, value)
        }

        return this
    }

    public get size(): number {
        return GM_listValues().length
    }

    public *values(): MapIterator<V> {
        const keys = GM_listValues()

        for (let i = 0; i < keys.length; ++i) {
            yield GM_getValue(keys[i])!
        }
    }

    abstract [Symbol.iterator]: BaseGMStore<K, V>['entries'];
}

export { BaseGMStore }
