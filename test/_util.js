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

function initBackingStore (map = new Map()) {
    return $store = map
}

module.exports = {
    API: {
        GM_deleteValue,
        GM_getValue,
        GM_listValues,
        GM_setValue,
    },
    initBackingStore,
}
