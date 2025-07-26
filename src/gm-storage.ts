import { GMStorageBase, type JSONValue } from './gm-storage-base.js'

const identity = <T>(value: T): T => value

class GMStorage<K extends string = string, V extends JSONValue = JSONValue> extends GMStorageBase<K, V> {
    protected parse = identity as (value: string) => K;
    protected stringify = identity as (value: K) => string;
}

export { GMStorage }
