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

const GMStorage = require('..')

Object.assign(global, API)

test.beforeEach(t => {
    const backingStore = initBackingStore()
    const store = new GMStorage()

    t.is(backingStore.size, 0)
    t.is(store.size, 0)
    t.not(store, backingStore)
    store.setAll(ENTRIES)
    t.is(store.size, FULL)
    t.context.store = store
})

test('clear', t => {
    const { store } = t.context

    t.is(store.size, FULL)
    store.clear()

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
        store.delete(key)
        t.false(store.has(key))
        t.is(store.size, i)
    }

    t.is(store.size, 0)
})

test('entries', t => {
    const { store } = t.context

    let i = 0

    for (const entry of store.entries()) {
        t.deepEqual(entry, ENTRIES[i++])
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

    store.forEach(function (value, key, _store) {
        t.is(this, undefined)
        t.is(_store, store)
        seen1[key] = value
    })

    t.deepEqual(seen1, OBJECT)

    store.forEach(function (value, key, _store) {
        t.is(this, $this)
        t.is(_store, store)
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
    const values1 = [['foo', 'bar'], ['baz', 'quux']]

    const values2 = function* () {
        yield ['foo', 1]
        yield ['bar', 2]
        yield ['baz', 3]
        yield ['quux', 4]
    }

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

test('JSON keys', t => {
    const { store } = t.context

    store.clear()
    store.set(1, 'number key 1')
    store.set(2, 'number key 2')

    t.is(store.size, 2)
    t.is(store.get(1), 'number key 1')
    t.is(store.get('1'), undefined)
    t.is(store.get(2), 'number key 2')
    t.is(store.get('2'), undefined)

    store.clear()
    store.set('1', 'string key 1')
    store.set('2', 'string key 2')

    t.is(store.size, 2)
    t.is(store.get('1'), 'string key 1')
    t.is(store.get(1), undefined)
    t.is(store.get('2'), 'string key 2')
    t.is(store.get(2), undefined)

    const array = [null, 42, 'foo', [1, 2, 3], { bar: 'baz' }]

    store.clear()
    store.set(array, 'array key')
    t.is(store.get(array), 'array key')
    t.deepEqual([...store.keys()], [array])

    const object1 = { foo: 'bar', baz: ['quux'] }
    const object2 = { baz: ['quux'], foo: 'bar' }

    store.clear()
    store.set(object1, 'object key')
    store.set(object2, 'object key')

    t.is(store.size, 1)
    t.deepEqual([...store.keys()], [object1])
    t.deepEqual([...store.keys()], [object2])

    const nullObject1 = Object.assign(Object.create(null), { foo: 1, bar: 2 })
    const nullObject2 = Object.assign(Object.create(null), { bar: 2, foo: 1 })

    store.clear()
    store.set(nullObject1, 'null object key')
    store.set(nullObject2, 'null object key')

    t.is(store.size, 1)
    t.deepEqual([...store.keys()], [nullObject1])
    t.deepEqual([...store.keys()], [nullObject2])

    const fakeObject1 = Object.assign(new RegExp(), { [Symbol.toStringTag]: 'Object', foo: 1, bar: 2 })
    const fakeObject2 = Object.assign(new RegExp(), { [Symbol.toStringTag]: 'Object', bar: 2, foo: 1 })

    t.is(fakeObject1.constructor, RegExp)
    t.is(fakeObject2.constructor, RegExp)
    t.not(JSON.stringify(fakeObject1), JSON.stringify(fakeObject2))

    store.clear()
    store.set(fakeObject1, 'fake object key 1') // {"foo":1,"bar":2}
    store.set(fakeObject2, 'fake object key 2') // {"bar":2,"foo":1}
    t.is(store.size, 2)
})

test('options.strict', t => {
    const oldGetValue = global.GM_getValue

    t.assert(typeof oldGetValue === 'function')

    try {
        delete global.GM_getValue

        t.is(global.GM_getValue, undefined)

        t.notThrows(() => new GMStorage({ strict: false }))

        t.throws(() => new GMStorage({ strict: true }), {
            instanceOf: ReferenceError,
            message: /GM_getValue is not defined/,
        })

        t.throws(() => new GMStorage(), {
            instanceOf: ReferenceError,
            message: /GM_getValue is not defined/,
        })

        global.GM_getValue = 42

        t.notThrows(() => new GMStorage({ strict: false }))

        t.throws(() => new GMStorage({ strict: true }), {
            instanceOf: TypeError,
            message: /GM_getValue is not a function/,
        })

        t.throws(() => new GMStorage(), {
            instanceOf: TypeError,
            message: /GM_getValue is not a function/,
        })
    } finally {
        global.GM_getValue = oldGetValue
    }
})
