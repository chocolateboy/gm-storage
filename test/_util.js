let $store = new Map()

function GM_deleteValue (key) {
    $store.delete(String(key))
}

function GM_getValue (_key, $default) {
    const key = String(_key)
    return $store.has(key) ? $store.get(key) : $default
}

function GM_listValues () {
    return Array.from($store.keys())
}

function GM_setValue (key, value) {
    $store.set(String(key), value)
}

function setBackingStore (value) {
    $store = value
}

module.exports = {
    GM_deleteValue,
    GM_getValue,
    GM_listValues,
    GM_setValue,
    setBackingStore,
}
