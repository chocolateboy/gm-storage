import { BaseGMStore, type JSONValue } from './base-gm-store.js'

const NOT_FOUND = Symbol()

class GMStore<K extends string = string, V extends JSONValue = JSONValue> extends BaseGMStore<K, V> {
    static {
        Object.assign(this.prototype, {
            [Symbol.iterator]: this.prototype.entries,
        })
    }

    public *entries(): MapIterator<[K, V]> {
        const keys = GM_listValues()

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i]
            yield [key as K, GM_getValue(key)!]
        }
    }

    public get(key: K): V | undefined
    public get<D>(key: K, $default: D): V | D
    public get(key: K, $default = undefined) {
        return GM_getValue(key, $default)
    }

    public has(key: K): boolean {
        return GM_getValue(key, NOT_FOUND) !== NOT_FOUND
    }

    public *keys(): MapIterator<K> {
        yield *(GM_listValues() as K[])
    }

    public remove(key: K): this {
        return GM_deleteValue(key), this
    }

    public set(key: K, value: V): this {
        return GM_setValue(key, value), this
    }
}

interface GMStore<K, V extends JSONValue = JSONValue> {
    [Symbol.iterator]: GMStore<K, V>['entries'];
}

export { GMStore }
