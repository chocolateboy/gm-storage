'use strict';

const test = require('ava')
const { initBackingStore, API } = require('./_util.js')

const ENTRIES = [['foo', 1], ['bar', 2], ['baz', 3], ['quux', 4]]
const FULL = ENTRIES.length

const entries = function* () {
    for (let i = 0; i < FULL; ++i) {
        yield ENTRIES[i]
    }
}

const { JSONKeyStorage } = require('..')

Object.assign(global, API)

test.beforeEach(t => {
    const backingStore = initBackingStore()
    const store = new JSONKeyStorage()

    t.is(backingStore.size, 0)
    t.is(store.size, 0)
    t.not(store, backingStore)
    store.setAll(ENTRIES)
    t.is(store.size, FULL)
    t.context.store = store
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

test('options.canonical', t => {
    const store = new JSONKeyStorage({ canonical: false })

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

    t.is(store.size, 2)
    t.deepEqual([...store.keys()], [object1, object2])

    const nullObject1 = Object.assign(Object.create(null), { foo: 1, bar: 2 })
    const nullObject2 = Object.assign(Object.create(null), { bar: 2, foo: 1 })

    store.clear()
    store.set(nullObject1, 'null object key')
    store.set(nullObject2, 'null object key')

    t.is(store.size, 2)
    t.deepEqual([...store.keys()], [nullObject1, nullObject2])

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
