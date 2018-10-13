'use strict';

let assert = require('assert'),
    store = require('../lib/dptstore.js');

describe('DPT Store', function () {

    it('should fill from json string', function () {
        const items = `{
            "1/1/1": { "main": 1, "sub": null },
            "1/2/2": { "main": 2, "sub": null },
            "1/3/3": { "main": 3, "sub": null }, 
            "1/4/4": { "main": 4, "sub": 1 },
            "1/5/5": { "main": 5, "sub": null }, 
            "1/6/6": { "main": 6, "sub": 20 }
            }`;
        let err = store.fill(items);
        assert.equal(err, null);
        //remove whitespace
        let test = items.replace(/\s/g, "");
        const testDump = store.dump();
        assert.equal(test, testDump);

        const itemsStrings = `{
            "1/1/1": "DPT1",
            "1/2/2": "Dpt2.000",
            "1/3/3": "dpt 3.0",
            "1/4/4": "DPT4.001",
            "1/5/5": "5",
            "1/6/6": "6 020"
            }`;
        err = store.fillParse(itemsStrings);
        assert.equal(err, null);

        assert.equal(testDump, store.dump());

    });

    it('should get a MainDPT for a GA String (.getMain)', function () {
        assert.equal(store.getMain('1/2/2'), 2);
    });

    it('should get a SubDPT for a GA String (.getSub)', function () {
        assert.equal(store.getSub('1/4/4'), 1);
        assert.equal(store.getSub('1/6/6'), 20);
        assert.equal(store.getSub('1/5/5'), null);
    });

    it('should add a value with "set"', function () {
        assert.equal(store.getMain('1/7/7'), false);
        store.setMain('1/7/7', 7);
        assert.equal(store.getMain('1/7/7'), 7);

        assert.equal(store.get('1/7/8'), false);
        store.set('1/7/8', 7, 8);
        assert.deepEqual(store.get('1/7/8'), { main: 7, sub: 8 });
        assert.equal(store.getMain('1/7/8'), 7);
        assert.equal(store.getSub('1/7/8'), 8);

        assert.equal(store.get('1/7/6'), false);
        store.setParse('1/7/6', 'DPT 7.600');
        assert.deepEqual(store.get('1/7/6'), { main: 7, sub: 600 });
    })

});
