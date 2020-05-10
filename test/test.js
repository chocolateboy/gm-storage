const test                 = require('ava')
const { setStore, ...API } = require('./_util.js')

Object.assign(global, API)

const GMStorage = require('..') // must be loaded after the API has been defined

const COUNT = 10

test.beforeEach(t => {
    const $store = new Map()

    setStore($store)

    const store = new GMStorage()

    t.is($store.size, 0)
    t.is(store.size, 0)
    t.not(store, $store)

    for (let i = 1; i <= COUNT; ++i) {
        t.is(store.size, i - 1)
        t.is(store.has(i), false)
        store.set(i, i)
        t.is(store.has(i), true)
        t.is(store.size, i)
    }

    t.is(store.size, COUNT)
    t.context.store = store
})

test('clear', t => {
    const { store } = t.context

    t.is(store.size, COUNT)
    store.clear()
    t.is(store.size, 0)
})

test('delete', t => {
    const { store } = t.context

    t.is(store.size, COUNT)

    for (let hit = COUNT; hit >= 1; --hit) {
        const miss = hit * -1

        t.is(store.size, hit)
        t.is(store.delete(miss), false)
        t.is(store.delete(hit), true)
        t.is(store.size, hit - 1)
    }

    t.is(store.size, 0)
})

test('entries', t => {
    const { store } = t.context

    // get entries as a plain object
    const entries = Array.from(store.entries())
    t.snapshot(entries)
})

test('forEach', t => {
    const { store } = t.context
    const $this = {}
    const seen = {}

    store.forEach(function (value, key, _store) {
        t.is(this, $this)
        t.is(_store, store)
        seen[key] = value
    }, $this)

    t.snapshot(seen)
})

test('get', t => {
    const { store } = t.context
    const $default = Symbol('default')

    for (let hit = 1; hit <= COUNT; ++hit) {
        const miss = hit * -1

        t.is(store.get(hit), hit)
        t.is(store.get(miss), undefined)
        t.is(store.get(hit, $default), hit)
        t.is(store.get(miss, $default), $default)
    }
})

test('has', t => {
    const { store } = t.context

    for (let hit = 1; hit <= COUNT; ++hit) {
        const miss = hit * -1

        t.is(store.has(hit), true)
        t.is(store.has(miss), false)
    }
})

test('keys', t => {
    const { store } = t.context
    t.snapshot(store.keys())
})

test('set', t => {
    const { store } = t.context

    store.clear()

    for (let i = 1; i <= COUNT; ++i) {
        t.is(store.size, i - 1)
        t.is(store.get(i), undefined)
        t.is(store.has(i), false)
        t.is(store.set(i, i), store)
        t.is(store.get(i), i)
        t.is(store.has(i), true)
        t.is(store.size, i)
    }

    const entries = Array.from(store.entries())

    t.snapshot(entries)
})

test('size', t => {
    const { store } = t.context

    for (let i = 1; i <= COUNT; ++i) {
        store.clear()

        t.is(store.size, 0)

        for (let j = 1; j <= i; ++j) {
            store.set(j, j)
        }

        t.is(store.size, i)
    }
})

test('values', t => {
    const { store } = t.context
    t.snapshot(Array.from(store.values()))
})
