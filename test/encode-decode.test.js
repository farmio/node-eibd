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
    //TODO: DTP 4,5,6,8,10,11,12,232
    let tests = [
        {type: 'DPT1', values: [0, 1, true, false]},
        {type: 'DPT2', values: [{control: true, value: true}, {control: true, value: false}, {control: false, value: true}, {control: false, value: false}]},
        {type: 'DPT3', values: [{control: true, step: 0}, {control: true, step: 2}, {control: true, step: 7}, {control: false, step: 0}, {control: false, step: 5}]},
        {type: 'DPT4.001', values: ['a', 'A', '&']},
        {type: 'DPT4.002', values: ['a', 'A', '&']},
        {type: 'DPT7', values: [31247]},
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
