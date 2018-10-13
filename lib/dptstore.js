'use strict';

const tools = require('./tools');

/**
 * stores group addresses as keys (String '1/2/4')
 * and an Object contiaining main Datapoint and Sub Datapoint as value
 * { main: {number}, sub: {number} }
 */
let store = {};

module.exports = {
    get: (key) => store.hasOwnProperty(key) ? store[key] : false,
    getMain: (key) => store.hasOwnProperty(key) ? store[key].main : false,
    getSub: (key) => store.hasOwnProperty(key) ? store[key].sub : false,
    set: (key, mainDpt, subDpt) => store[key] = { main: mainDpt, sub: subDpt },
    setMain: (key, val) => store[key] = { main: val, sub: null },
    setParse: (key, string) => store[key] = tools.dptParse(string),
    fill: (json) => {
        try {
            store = JSON.parse(json);
            return null;
        }
        catch (err) {
            return err;
        }
    },
    fillParse: (json) => {
        try {
            store = JSON.parse(json, (key, value) =>
                typeof value === 'string'
                    ? tools.dptParse(value)
                    : value
            );
            return null;
        }
        catch (err) {
            return err;
        }
    },
    dump: () => JSON.stringify(store)
};
