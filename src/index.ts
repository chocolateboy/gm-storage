export type Key = string;

export type Value =
    | undefined
    | null
    | number
    | string
    | Array<Value>
    | { [key: string]: Value };

export type Callback<T, V> = (
    this: (T | undefined),
    value: V,
    key: Key,
    store: GMStorage<V>
) => void;

export type Options = {
    verify?: boolean;
}

const $GM_API = {
    deleteValue: GM_deleteValue,
    getValue:    GM_getValue,
    listValues:  GM_listValues,
    setValue:    GM_setValue,
}

const NOT_FOUND = Symbol()
const OPTIONS = { verify: true }

class GMStorage<V = Value> {
    constructor (_options: Options = {}) {
        const options = Object.assign({}, OPTIONS, _options || {})
        const { verify } = options

        if (verify) {
            for (const [key, value] of Object.entries($GM_API)) {
                if (!value) {
                    throw new ReferenceError(`GM_${key} is not defined`)
                }

                if (typeof value !== 'function') {
                    throw new TypeError(`GM_${key} is not a function`)
                }
            }
        }
    }

    public clear () {
        const { deleteValue } = $GM_API

        for (const key of this.keys()) {
            deleteValue!(key)
        }
    }

    public delete (key: Key) {
        const deleted = this.has(key)
        $GM_API.deleteValue!(key)
        return deleted
    }

    public *entries (): Generator<[Key, V]> {
        for (const key of this.keys()) {
            const value = this.get(key)
            yield [key, value]
        }
    }

    // "The length property of the forEach method is 1."
    // https://www.ecma-international.org/ecma-262/6.0/#sec-map.prototype.foreach
    public forEach<U> (callback: Callback<U, V>, $this?: U) {
        for (const [key, value] of this.entries()) {
            callback.call($this, value, key, this)
        }
    }

    public get (key: Key): V
    public get<D> (key: Key, $default: D): V | D
    public get (...args: any[]) {
        return args.length === 2 ? $GM_API.getValue!(args[0], args[1]) : $GM_API.getValue!(args[0])
    }

    public has (key: Key): boolean {
        return $GM_API.getValue!(key, NOT_FOUND) !== NOT_FOUND
    }

    public keys (): Array<Key> {
        return $GM_API.listValues!()
    }

    public set (key: Key, value: V) {
        $GM_API.setValue!(key, value)
        return this
    }

    public get size () {
        return this.keys().length
    }

    public *values () {
        for (const key of this.keys()) {
            yield this.get(key)
        }
    }
}

/* aliases */

// XXX why is this necessary (in addition to the assignment)?
//
// https://stackoverflow.com/a/47648460
// interface GMStorage<V = Value> {
//     [Symbol.iterator]: GMStorage<V>['entries'];
// }

Object.assign(GMStorage.prototype, {
    [Symbol.iterator]: GMStorage.prototype.entries,
})

export default GMStorage
