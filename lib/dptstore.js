'use strict';

const tools = require('./tools');

/**
 * stores group addresses as keys (String '1/2/4')
 * and an Object contiaining main Datapoint and Sub Datapoint as value
 * { main: {number}, sub: {number} }
 */
let store = {};

module.exports = {
    get:        function (key) { return store.hasOwnProperty(key) ? store[key] : false },
    getMain:    function (key) { return store.hasOwnProperty(key) ? store[key].main : false },
    getSub:     function (key) { return store.hasOwnProperty(key) ? store[key].sub : false },
    set:        function (key, mainDpt, subDpt) { store[key] = {main: mainDpt, sub: subDpt}; return null },
    setMain:    function (key, val) { store[key] = {main: val}; return null },
    setParse:   function (key, string) { store[key] = tools.dptParse(string); return null },
    fill:       function (json) { 
                    try {
                        store = JSON.parse(json);
                        return null;
                    }
                    catch (err) {
                        return err;
                    }
                },
    dump:       function () { return JSON.stringify(store) }
};
