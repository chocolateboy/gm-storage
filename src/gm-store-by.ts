import { GMStore } from './gm-store.js'

import {
    checkFunction,
    BaseGMStore,
    type JSONValue,
    type Options
} from './base-gm-store.js'

export interface Key<K> {
    parse: (key: string) => K;
    stringify: (key: K) => string;
}

export interface GMStoreByOptions<K> extends Options {
    key: Key<K>;
}

const HOOKS = ['parse', 'stringify'] as const

class GMStoreBy<K, V extends JSONValue = JSONValue> extends BaseGMStore<K, V> {
    #store: GMStore<string, V>;
    #parse: Key<K>['parse'];
    #stringify: Key<K>['stringify'];

    static {
        Object.assign(this.prototype, {
            [Symbol.iterator]: this.prototype.entries,
        })
    }

    constructor(options: GMStoreByOptions<K>) {
        const key = options?.key

        for (const name of HOOKS) {
            checkFunction(`key.${name}`, key?.[name])
        }

        super(options)

        // check will have already been done in the super call if not disabled
        this.#store = new GMStore({ strict: false })
        this.#parse = key.parse
        this.#stringify = key.stringify
    }

    public *entries(): MapIterator<[K, V]> {
        for (const [key, value] of this.#store.entries()) {
            yield [this.#parse(key), value]
        }
    }

    public get(key: K): V | undefined
    public get<D>(key: K, $default: D): V | D
    public get(key: K, $default = undefined) {
        return this.#store.get(this.#stringify(key), $default)
    }

    public has(key: K): boolean {
        return this.#store.has(this.#stringify(key))
    }

    public *keys(): MapIterator<K> {
        const decode = this.#parse

        for (const key of this.#store.keys()) {
            yield decode(key)
        }
    }

    public remove(key: K): void {
        this.#store.remove(this.#stringify(key))
    }

    public set(key: K, value: V): this {
        return this.#store.set(this.#stringify(key), value), this
    }
}

interface GMStoreBy<K, V extends JSONValue = JSONValue> {
    [Symbol.iterator]: GMStoreBy<K, V>['entries'];
}

export { GMStoreBy }
