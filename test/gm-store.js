'use strict';

const test = require('ava')
const { initBackingStore, API } = require('./_util.js')

const ENTRIES = [['foo', 1], ['bar', 2], ['baz', 3], ['quux', 4]]
const FULL    = ENTRIES.length
const KEYS    = ENTRIES.map(it => it[0])
const NON_KEY = 'no-such-key'
const OBJECT  = Object.fromEntries(ENTRIES)
const VALUES  = ENTRIES.map(it => it[1])

const entries = function* () {
    for (let i = 0; i < FULL; ++i) {
        yield ENTRIES[i]
    }
}

const { GMStore } = require('..')

Object.assign(global, API)

test.beforeEach(t => {
    const backingStore = initBackingStore()
    const store = new GMStore()

    t.is(backingStore.size, 0)
    t.is(store.size, 0)
    t.not(store, backingStore)
    store.setAll(ENTRIES)
    t.is(store.size, FULL)
    t.context.store = store
})

test('clear', t => {
    const { store } = t.context

    for (const key of KEYS) {
        t.true(store.has(key))
    }

    t.is(store.size, FULL)
    store.clear()
    t.is(store.size, 0)

    for (const key of KEYS) {
        t.false(store.has(key))
    }
})

test('delete', t => {
    const { store } = t.context

    t.is(store.size, FULL)

    for (let i = FULL - 1; i >= 0; --i) {
        const key = KEYS[i]
        t.is(store.size, i + 1)
        t.true(store.has(key))
        t.is(store.delete(key), true)
        t.false(store.has(key))
        t.is(store.delete(key), false)
        t.is(store.size, i)
    }

    t.is(store.size, 0)
})

test('entries', t => {
    const { store } = t.context

    let i = -1

    for (const entry of store.entries()) {
        t.deepEqual(entry, ENTRIES[++i])
    }

    store.clear()

    for (const entry of store.entries()) {
        t.fail()
    }
})

test('forEach', t => {
    const { store } = t.context
    const $this = { this: true }
    const seen1 = {}
    const seen2 = {}

    store.forEach(function (value, key, $store) {
        t.is(this, undefined)
        t.is($store, store)
        t.true($store instanceof GMStore)
        seen1[key] = value
    })

    t.deepEqual(seen1, OBJECT)

    store.forEach(function (value, key, $store) {
        t.is(this, $this)
        t.is($store, store)
        seen2[key] = value
    }, $this)

    t.deepEqual(seen2, OBJECT)
})

test('get', t => {
    const { store } = t.context
    const $default = Symbol('default')

    for (const [key, value] of ENTRIES) {
        t.is(store.get(NON_KEY), undefined)
        t.is(store.get(NON_KEY, $default), $default)
        t.is(store.get(key), value)
        t.is(store.get(key, $default), value)
    }
})

test('getOrInsert', t => {
    const { store } = t.context
    const $default = Symbol('default')

    for (const [key, value] of ENTRIES) {
        const newKey = key.toUpperCase()
        const newValue = value ** 2

        t.is(store.getOrInsert(key, $default), value)
        t.is(store.getOrInsert(newKey, newValue), newValue)
        t.is(store.getOrInsert(newKey, $default), newValue)
        t.is(store.getOrInsert(key, $default), value)
    }

    t.is(store.size, FULL * 2)
})

test('getOrInsertComputed', t => {
    const { store } = t.context
    const $default = Symbol('default')
    const fail = t.fail.bind(t)

    for (const [key, value] of ENTRIES) {
        const newKey = key.toUpperCase()
        const newValue = value ** 2

        t.is(store.getOrInsertComputed(key, fail), value)
        t.is(store.getOrInsertComputed(newKey, () => newValue), newValue)
        t.is(store.getOrInsertComputed(newKey, fail), newValue)
        t.is(store.delete(newKey), true)
        t.is(store.getOrInsertComputed(newKey, key => key), newKey)
        t.is(store.getOrInsertComputed(newKey, fail), newKey)
        t.is(store.getOrInsertComputed(key, fail), value)
    }

    t.is(store.size, FULL * 2)
})

test('has', t => {
    const { store } = t.context

    for (const key of KEYS) {
        t.false(store.has(NON_KEY))
        t.true(store.has(key))
        store.delete(key)
        t.false(store.has(key))
    }
})

test('keys', t => {
    const { store } = t.context
    const seen = []

    t.false(Array.isArray(store.keys())) // no longer an array

    for (const key of store.keys()) {
        seen.push(key)
    }

    t.deepEqual(seen, KEYS)

    store.clear()

    for (const key of store.keys()) {
        t.fail()
    }
})

test('remove', t => {
    const { store } = t.context

    t.is(store.size, FULL)

    for (let i = FULL - 1; i >= 0; --i) {
        const key = KEYS[i]
        t.is(store.size, i + 1)
        t.true(store.has(key))
        t.is(store.remove(key), store)
        t.false(store.has(key))
        t.is(store.size, i)
    }

    t.is(store.size, 0)
})

test('removeAll', t => {
    const { store } = t.context

    t.is(store.size, FULL)
    t.is(store.removeAll(), store)
    t.is(store.size, FULL)
    t.is(store.removeAll(['foo', 'baz']), store)
    t.is(store.size, FULL - 2)
    t.deepEqual([...store.keys()], ['bar', 'quux'])
})

test('set', t => {
    const { store } = t.context

    for (const [key, value] of ENTRIES) {
        store.set(key, value)
        t.deepEqual([...store.entries()], ENTRIES)
    }

    store.clear()
    t.is(store.size, 0)

    for (let i = 0; i < FULL; ++i) {
        const [key, value] = ENTRIES[i]
        t.is(store.size, i)
        t.false(store.has(key))
        store.set(key, value)
        t.true(store.has(key))
        t.is(store.size, i + 1)
    }

    t.is(store.size, FULL)
})

test('setAll', t => {
    const { store } = t.context

    store.clear()

    const verify = () => {
        t.is(store.size, FULL)

        for (const [key, value] of ENTRIES) {
            t.true(store.has(key))
            t.is(store.get(key), value)
        }
    }

    store.setAll(ENTRIES)
    verify()

    store.clear()
    store.setAll(entries())
    verify()

    store.setAll()
    verify()

    store.setAll([])
    verify()
})

test('size', t => {
    const { store } = t.context

    store.clear()

    for (let i = 0; i < FULL; ++i) {
        t.is(store.size, i)
        const [key, value] = ENTRIES[i]
        store.set(key, value)
        t.is(store.size, i + 1)
    }

    t.is(store.size, FULL)
})

test('values', t => {
    const { store } = t.context
    const seen = []

    for (const value of store.values()) {
        seen.push(value)
    }

    t.deepEqual(seen, VALUES)

    store.clear()

    for (const value of store.values()) {
        t.fail()
    }
})

test('Symbol.iterator', t => {
    const { store } = t.context

    let i = -1

    for (const entry of store) {
        t.deepEqual(entry, ENTRIES[++i])
    }

    store.clear()

    for (const entry of store) {
        t.fail()
    }
})

test('Symbol.toStringTag', t => {
    const { store } = t.context
    t.is({}.toString.call(store), '[object GMStorage]')
})

test('options.strict', t => {
    const oldGetValue = global.GM_getValue

    t.assert(typeof oldGetValue === 'function')

    try {
        delete global.GM_getValue

        t.is(global.GM_getValue, undefined)

        t.notThrows(() => new GMStore({ strict: false }))

        t.throws(() => new GMStore({ strict: true }), {
            instanceOf: ReferenceError,
            message: /GM_getValue is not defined/,
        })

        t.throws(() => new GMStore(), {
            instanceOf: ReferenceError,
            message: /GM_getValue is not defined/,
        })

        global.GM_getValue = 42

        t.notThrows(() => new GMStore({ strict: false }))

        t.throws(() => new GMStore({ strict: true }), {
            instanceOf: TypeError,
            message: /GM_getValue is not a function/,
        })

        t.throws(() => new GMStore(), {
            instanceOf: TypeError,
            message: /GM_getValue is not a function/,
        })
    } finally {
        global.GM_getValue = oldGetValue
    }
})
