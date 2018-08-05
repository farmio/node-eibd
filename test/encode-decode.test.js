'use strict';

let assert = require('assert'),
    Encoder = require('../lib/encoder.js'),
    Decoder = require('../lib/decoder.js'),
    tools = require('../lib/tools.js');

let enc = null;
let dec = null;

describe('Encode-Decode-Loop', function() {

  before(function() {
    enc = new Encoder();
    dec = new Decoder();
  });
  describe('Encode values and decode it with given DPT', function() {
    //TODO: DTP 5,6,8,10,11,12,232
    let tests = [
        {type: 'DPT1', values: [0, 1, true, false]},
        {type: 'DPT2', values: [{control: true, value: true}, {control: true, value: false}, {control: false, value: true}, {control: false, value: false}]},
        {type: 'DPT3', values: [{control: true, step: 0}, {control: true, step: 2}, {control: true, step: 7}, {control: false, step: 0}, {control: false, step: 5}]},
        {type: 'DPT4.001', values: ['a', 'A', '&']},
        {type: 'DPT4.002', values: ['a', 'A', '&']},
        {type: 'DPT5', values: [0, 1, 15, 32, 50, 100, 128, 139, 200, 230, 255]},
        {type: 'DPT5.001', values: [0, 0.4, 100]}, // 15, 32, 50
        {type: 'DPT5.002', values: [0, 2.8, 360]}, // integer ? ets value
        {type: 'DPT6', values: [-128, -5, 0, 13, 127]},
        {type: 'DPT6.020', values: [{a: true, b: false, c: true, d: false, e: true, mode: 1}]},
        {type: 'DPT7', values: [31247]},
        {type: 'DPT8', values: [-32768, -50, 0, 559, 32767]},
        {type: 'DPT9', values: [-670105.6, -1.2, 0, 15.4, 670760.96]}, // breaking: 900; 900.2
        {type: 'DPT10', values: [{hour: 1, minutes: 1, seconds: 1, day: 1}, {hour: 23, minutes: 59, seconds: 2, day: 0}]},
        {type: 'DPT11', values: [new Date(2018, 7, 4)]},
        {type: 'DPT12', values: [0, 14, 4294967295]},
        {type: 'DPT13', values: [-2147483648, 0, 2147483647]},
        {type: 'DPT14', values: [30.5]}
    ]
    tests.forEach(function(test) {
        it('should encode ' + test.type + ' value and decode it again', function() {
            test.values.forEach( function(value){
                const dpType = tools.dptParse(test.type);
                const buf = Buffer.from(enc.encode(dpType, value));
                dec.decodeAs(dpType, buf, function(err, type, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result, value);
                });
            })
        });
    });
  });
});
