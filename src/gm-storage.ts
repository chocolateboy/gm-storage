import { GMStorageBase }            from './gm-storage-base.js'
import { identity, type JSONValue } from './util.js'

class GMStorage<K extends string = string, V extends JSONValue = JSONValue> extends GMStorageBase<K, V> {
    protected parse = identity as (value: string) => K;
    protected stringify = identity as (value: K) => string;
}

export { GMStorage }
