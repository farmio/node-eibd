'use strict';

/**
 * stores group addresses as keys (String '1/2/4')
 * and its datapoint type as value (Sting 'DPT7')
 */
module.exports = function () {
    let store = {};
    return {
        get: function (key) { return store.hasOwnProperty(key) ? store[key] : false },
        set: function (key, val) { cache[key] = val; }
    };
}();
