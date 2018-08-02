'use strict';

var assert = require('assert'),
    createMessage = require('../lib/creator.js');
const tools = require('../lib/tools');


describe('Creator', function() {

  it('should create DPT1 messages', function() {
    assert.deepEqual(createMessage('write','DPT1',true), [0, 129]);
    assert.deepEqual(createMessage('write','DPT1',false), [0, 128]);

    assert.deepEqual(createMessage('write','DPT1',1), [0, 129]);
    assert.deepEqual(createMessage('write','DPT1',0), [0, 128]);

    assert.deepEqual(createMessage('read','DPT1', true), [0, 0]);
    assert.deepEqual(createMessage('read','DPT1'), [0, 0]);
    assert.deepEqual(createMessage('read'), [0, 0]);

    assert.deepEqual(createMessage('response','DPT1',true), [0, 65]);
    assert.deepEqual(createMessage('response','DPT1',false), [0, 64]);
  });

   it('should create DPT2 messages', function() {
    assert.deepEqual(createMessage('write','DPT2', {control: true, value: true}), [0, 131]);
    assert.deepEqual(createMessage('write','DPT2', {control: false, value: true}), [0, 129]);

    assert.deepEqual(createMessage('read','DPT2', true), [0, 0]);
    assert.deepEqual(createMessage('read','DPT2'), [0, 0]);
    assert.deepEqual(createMessage('read'), [0, 0]);

    assert.deepEqual(createMessage('response','DPT2',{control: false, value: false}), [0, 64]);
    assert.deepEqual(createMessage('response','DPT2',{control: true, value: false}), [0, 66]);
  });

    it('should create DPT3 messages', function() {
    assert.deepEqual(createMessage('write','DPT3',{control: false, step: 0}), [0, 0x80]);
    assert.deepEqual(createMessage('write','DPT3',{control: true, step: 7}), [0, 0x8F]);

    assert.deepEqual(createMessage('read','DPT3', true), [0, 0]);
    assert.deepEqual(createMessage('read','DPT3'), [0, 0]);
    assert.deepEqual(createMessage('read'), [0, 0]);

    assert.deepEqual(createMessage('response','DPT3',{control: false, step: 7}), [0, 0x47]);
    assert.deepEqual(createMessage('response','DPT3',{control: true, step: 1}), [0, 0x49]);
  });

  it('should create DPT5 messages', function() {
    assert.deepEqual(createMessage('write','DPT5',5), [0, 128, 5]);
    assert.deepEqual(createMessage('read','DPT5'), [0, 0]);
    assert.deepEqual(createMessage('response','DPT5',4), [0, 64, 4]);
  });

  it('should create DPT7 messages', function() {
    assert.deepEqual(createMessage('write','DPT7',0), [0, 128, 0x00, 0x00]);
    assert.deepEqual(createMessage('write','DPT7.001',31247), [0, 128, 0x7A, 0x0F]);
    assert.deepEqual(createMessage('write','DPT7.600',2550), [0, 128, 0x09, 0xF6]);
    assert.deepEqual(createMessage('read','DPT7'), [0, 0]);
    assert.deepEqual(createMessage('response','DPT7',65535), [0, 64, 0xFF, 0xFF]);
  });

  it('should create DPT9 messages', function() {
    assert.deepEqual(createMessage('write','DPT9',-5.08), [0, 128, 0x86, 0x4]);
    assert.deepEqual(createMessage('read','DPT9'), [0, 0]);
    assert.deepEqual(createMessage('response','DPT9',-5.08), [0, 64, 0x86, 0x4]);
  });

});
