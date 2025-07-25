import { GMStorageBase }                    from './gm-storage-base.js'
import { parse, stringify, type JSONValue } from './util.js'

class JSONKeyStorage<K extends JSONValue = JSONValue, V extends JSONValue = JSONValue> extends GMStorageBase<K, V> {
    protected parse = parse as (value: string) => K;
    protected stringify = stringify as (value: K) => string;
}

export { JSONKeyStorage }
