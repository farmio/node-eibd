'use strict';

var assert = require('assert'),
    Encoder = require('../lib/encoder.js'),
    tools = require('../lib/tools.js');

var enc = null;

describe('Encoder', function() {

  before(function() {
    enc = new Encoder();
  });

  describe('DPT1 encode', function() {
    const dpt = tools.dptParse('DPT1');
    it('should encode DPT1 value', function() {
      var buffer = enc.encode(dpt,0);
      assert.equal(buffer.readUInt8(0), 0);

      buffer = enc.encode(dpt,1);
      assert.equal(buffer.readUInt8(0), 1);

      buffer = enc.encode(dpt,5);
      assert.equal(buffer.readUInt8(0), 1);

      buffer = enc.encode(dpt,6);
      assert.equal(buffer.readUInt8(0), 0);
    });
  });

  describe('DPT2 encode', function() {
    const dpt = tools.dptParse('DPT2');
    it('should encode DPT2 value', function() {
      var buffer = enc.encode(dpt, {control: false, value: false});
      assert.equal(buffer.readUInt8(0), 0);

      buffer = enc.encode(dpt, {control: true, value: true});
      assert.equal(buffer.readUInt8(0), 3);

      buffer = enc.encode(dpt, {control: false, value: true});
      assert.equal(buffer.readUInt8(0), 1);

      buffer = enc.encode(dpt, {control: true, value: false});
      assert.equal(buffer.readUInt8(0), 2);
    });
  });

  describe('DPT3 encode', function() {
    const dpt = tools.dptParse('DPT3');
    it('should encode DPT3 value', function() {
      var buffer = enc.encode(dpt, {control: true, step: 7});
      assert.equal(buffer.readUInt8(0), 0xF);

      buffer = enc.encode(dpt, {control: true, step: 4});
      assert.equal(buffer.readUInt8(0), 0xC);

      buffer = enc.encode(dpt, {control: false, step: 0});
      assert.equal(buffer.readUInt8(0), 0x0);

      buffer = enc.encode(dpt, {control: false, step: 3});
      assert.equal(buffer.readUInt8(0), 0x3);
    });
  });

  describe('DPT4 encode', function() {
    it('should encode DPT4.001 value', function() {
      const dpt = tools.dptParse('DPT4.001');
      var buffer = enc.encode(dpt,'a');
      assert.equal(buffer.readUInt8(0), 0x61);
    });

    it('should encode DPT4.002 value', function() {
      const dpt = tools.dptParse('DPT4.002');
      var buffer = enc.encode(dpt,'ö');
      assert.equal(buffer.readUInt8(0), 0xF6);
    });
  });

  describe('DPT5 encode', function() {
    const dpt = tools.dptParse('DPT5');
    it('should encode DPT5 value', function() {
      var buffer = enc.encode(dpt,40);
      assert.equal(buffer.readUInt8(0), 40);
    });
  });

  describe('DPT7 encode', function() {
    const dpt = tools.dptParse('DPT7');
    it('should encode DPT7 value', function() {
      var buffer = enc.encode(dpt,0);
      assert.equal(buffer.readUInt16BE(0), 0x0000);

      buffer = enc.encode(dpt,2550);
      assert.equal(buffer.readUInt16BE(0), 0x09F6);

      buffer = enc.encode(dpt,31247);
      assert.equal(buffer.readUInt16BE(0), 0x7A0F);

      buffer = enc.encode(dpt,65535);
      assert.equal(buffer.readUInt16BE(0), 0xFFFF);
    });
  });

  describe('DPT9 encode', function() {
    const dpt = tools.dptParse('DPT9');
    it('should encode DPT9 value', function() {
      var buffer = enc.encode(dpt,40);
      var value = buffer.readUInt16BE(0);
      assert.equal(value, 0x0FD0); // was: 0x13e8

      buffer = enc.encode(dpt,50);
      value = buffer.readUInt16BE(0);
      assert.equal(value, 0x14e2);
    });

    it('should encode DPT9 floating value', function() {
      var buffer = enc.encode(dpt,20.2);
      var value = buffer.readUInt16BE(0);
      assert.equal(value, 0x07E4); // was 0x11F9

      buffer = enc.encode(dpt,20.2);
      value = buffer.readUInt16BE(0);
      assert.equal(value, 0x07E4);
    });

    it('should encode DPT9 negative value', function() {
      var buffer = enc.encode(dpt,-100.32);
      var value = buffer.readUInt16BE(0);
      assert.equal(value, 0x9B1A);

      buffer = enc.encode(dpt,-175.84);
      value = buffer.readUInt16BE(0);
      assert.equal(value, 0xA3B5);

      buffer = enc.encode(dpt,-199.52);
      value = buffer.readUInt16BE(0);
      assert.equal(value, 0xA321);

      buffer = enc.encode(dpt,-200.32);
      value = buffer.readUInt16BE(0);
      assert.equal(value, 0xA31C); // was: 0xB6C7

      buffer = enc.encode(dpt,-5.08);
      value = buffer.readUInt16BE(0);
      assert.equal(value, 0x8604);
    });

    it('should not encode DPTNOTIMPLEMENTED', function() {
      var buffer = enc.encode('DPTNOTIMPLEMENTED', -5.08);
      assert.equal(buffer, undefined);
    });

  });

  describe('DPT10 encoder', function() {
    const dpt = tools.dptParse('DPT10');
    it('should encode DPT10 value', function(done) {
      const dayOfTheWeek = 2; // Tuesday -> 010
      const hour = 10; // 10 AM  ->  01010
      const minutes = 43;
      const seconds = 5;
      const time = {hour: hour, minutes: minutes, seconds: seconds, day: dayOfTheWeek}
      const buffer = enc.encode(dpt, time);
      const value0 = buffer.readUInt8(0); // Read the first octect
      const value1 = buffer.readUInt8(1); // Read the second octect
      const value2 = buffer.readUInt8(2);  // Read the third octect

      //assert.equal(value0, 0x4A); // 01001010 = 4A
      assert.equal(value0 >>> 5, 0b010);
      assert.equal(value0 & 0b11111, 0b01010);
      assert.equal(value1, 0x2B); // 43 = 00101011 = 2B
      assert.equal(value2, 0x05); // 5 = 00000101 = 05

      done();
    });
  });

  describe('DPT11 encoder', function() {
    const dpt = tools.dptParse('DPT11');
    it('should encode DPT11 value', function(done) {

      var day = 2; // February -> 010
      var month = 10; // 10 day  -> A
      var year = 14; // 14 -> 0xE -> 00001110

      var buffer = enc.encode(dpt, new Date(2000 + year, month -1, day));
      var value0 = buffer.readUInt8(0); // Read the first octect
      var value1 = buffer.readUInt8(1); // Read the second octect
      var value2 = buffer.readUInt8(2);  // Read the third octect

      assert.equal(value0, 0x02); // 00000010 = 2
      assert.equal(value1, 0x0A); // 10 = 00001010 = A
      assert.equal(value2, 0x0E); // 14 = 00001110 = 05

      done();
    });
  });

  describe('DPT14 encode', function() {
    const dpt = tools.dptParse('DPT14');
    let buf2str = function (buf) {
      return buf.toString('hex').toUpperCase();
    }

    it('should encode DPT14 value', function() {
      var buffer = enc.encode(dpt,40);
      assert.equal(buf2str(buffer), '42200000');

      buffer = enc.encode(dpt,35748613549);
      assert.equal(buf2str(buffer), '51052C89');
    });

    it('should encode DPT14 floating value', function() {
      var buffer = enc.encode(dpt,20.2);
      assert.equal(buf2str(buffer), '41A1999A');

      buffer = enc.encode(dpt,423.2584);
      assert.equal(buf2str(buffer), '43D3A113');
    });

    it('should encode DPT14 negative value', function() {
      var buffer = enc.encode(dpt,-8787.84);
      assert.equal(buf2str(buffer), 'C6094F5C');

      buffer = enc.encode(dpt,-14);
      assert.equal(buf2str(buffer), 'C1600000');
    });
  });
});
