'use strict';

export type Callback<V extends Value, U> = (
    this: (U | undefined),
    value: V,
    key: string,
    store: GMStorage<V>
) => void;

export type Options = {
    strict?: boolean;
};

export type Value =
    | null
    | boolean
    | number
    | string
    | Array<Value>
    | { [key: string]: Value };

// these are defined as globals in @types/tampermonkey
// const: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
const GM_API_KEYS = <const>['GM_deleteValue', 'GM_getValue', 'GM_listValues', 'GM_setValue'];

const NOT_FOUND = Symbol()
const OPTIONS = { strict: true }

// minification helper
const $global = globalThis

class GMStorage<V extends Value = Value> implements Map<string, V> {
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

    private _keys (): Array<string> {
        return $global.GM_listValues()
    }

    public clear (): void {
        for (const key of this._keys()) {
            $global.GM_deleteValue(key)
        }
    }

    public delete (key: string): boolean {
        return this.has(key) && ($global.GM_deleteValue(key), true)
    }

    public *entries (): IterableIterator<[string, V]> {
        for (const key of this._keys()) {
            const value = this.get(key) as V
            yield [key, value]
        }
    }

    // "The length property of the forEach method is 1."
    // https://www.ecma-international.org/ecma-262/6.0/#sec-map.prototype.foreach
    public forEach<U> (callback: Callback<V, U>, $this?: U): void {
        for (const [key, value] of this.entries()) {
            callback.call($this, value, key, this)
        }
    }

    public get (key: string): V | undefined
    public get <D>(key: string, $default: D): V | D
    public get (key: string, $default?: any) {
        return $global.GM_getValue(key, $default)
    }

    public has (key: string): boolean {
        return $global.GM_getValue(key, NOT_FOUND) !== NOT_FOUND
    }

    public *keys (): IterableIterator<string> {
        yield* this._keys()
    }

    public set (key: string, value: V): this {
        $global.GM_setValue(key, value)
        return this
    }

    public get size (): number {
        return this._keys().length
    }

    public *values (): IterableIterator<V> {
        for (const key of this._keys()) {
            yield this.get(key) as V
        }
    }
}

/* aliases */

interface GMStorage<V extends Value = Value> extends Map<string, V> {
    [Symbol.iterator]: GMStorage<V>['entries'];
}

Object.assign(GMStorage.prototype, {
    [Symbol.iterator]: GMStorage.prototype.entries,
})

export default GMStorage
