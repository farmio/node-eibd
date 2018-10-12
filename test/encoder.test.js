'use strict';

const assert = require('assert'),
  Encoder = require('../lib/encoder.js'),
  tools = require('../lib/tools.js');

/**
* Tests encoder methods for dpt types
* Encoded values should equal values encoded by ETS
*/

let enc = null;
let buffer;

//TODO: 6.020

describe('Encoder', function () {

  before(function () {
    enc = new Encoder();
  });

  it('should not encode unimplemented DPT', function () {
    const dpt = tools.dptParse('DPT0');
    buffer = enc.encode(dpt, -5.08);
    assert.equal(buffer, undefined);
  });

  describe('Sub-1-byte Encoder', function () {

    it('should encode DPT1 value', function () {
      const dpt = tools.dptParse('DPT1');
      buffer = enc.encode(dpt, 0);
      assert.equal(buffer.readUInt8(0), 0);

      buffer = enc.encode(dpt, 1);
      assert.equal(buffer.readUInt8(0), 1);

      buffer = enc.encode(dpt, 5);
      assert.equal(buffer.readUInt8(0), 1);

      buffer = enc.encode(dpt, 6);
      assert.equal(buffer.readUInt8(0), 0);
    });

    it('should encode DPT2 values', function () {
      const dpt = tools.dptParse('DPT2');
      buffer = enc.encode(dpt, { control: false, value: false });
      assert.equal(buffer.readUInt8(0), 0);

      buffer = enc.encode(dpt, { control: true, value: true });
      assert.equal(buffer.readUInt8(0), 3);

      buffer = enc.encode(dpt, { control: false, value: true });
      assert.equal(buffer.readUInt8(0), 1);

      buffer = enc.encode(dpt, { control: true, value: false });
      assert.equal(buffer.readUInt8(0), 2);
    });

    it('should encode DPT3 values', function () {
      const dpt = tools.dptParse('DPT3');
      buffer = enc.encode(dpt, { control: true, step: 7 });
      assert.equal(buffer.readUInt8(0), 0xF);

      buffer = enc.encode(dpt, { control: true, step: 4 });
      assert.equal(buffer.readUInt8(0), 0xC);

      buffer = enc.encode(dpt, { control: false, step: 0 });
      assert.equal(buffer.readUInt8(0), 0x0);

      buffer = enc.encode(dpt, { control: false, step: 3 });
      assert.equal(buffer.readUInt8(0), 0x3);
    });

  });

  describe('1 byte Encoder', function () {

    it('should encode DPT4.001 values', function () {
      const dpt = tools.dptParse('DPT4.001');
      buffer = enc.encode(dpt, 'a');
      assert.equal(buffer.readUInt8(0), 0x61);
    });

    it('should encode DPT4.002 values', function () {
      const dpt = tools.dptParse('DPT4.002');
      buffer = enc.encode(dpt, 'ö');
      assert.equal(buffer.readUInt8(0), 0xF6);
    });

    it('should encode DPT5 values', function () {
      const dpt = tools.dptParse('DPT5');
      buffer = enc.encode(dpt, 40);
      assert.equal(buffer.readUInt8(0), 40);
    });

    it('should encode DPT6 values', function () {
      const dpt = tools.dptParse('DPT6');
      buffer = enc.encode(dpt, -128);
      assert.equal(buffer.readUInt8(0), 0x80);

      buffer = enc.encode(dpt, 0);
      assert.equal(buffer.readUInt8(0), 0x00);

      buffer = enc.encode(dpt, 40);
      assert.equal(buffer.readUInt8(0), 0x28);

      buffer = enc.encode(dpt, 127);
      assert.equal(buffer.readUInt8(0), 0x7F);
    });

    it('should encode DPT6.020 values', function () {
      const dpt = tools.dptParse('DPT6.020');
      buffer = enc.encode(dpt, { a: true, b: false, c: true, d: false, e: true, mode: 1 });
      assert.equal(buffer.readUInt8(0), 0b10101010);

      buffer = enc.encode(dpt, { a: false, b: true, c: false, d: true, e: false, mode: 2 });
      assert.equal(buffer.readUInt8(0), 0b01010100);

      buffer = enc.encode(dpt, { a: false, b: false, c: false, d: false, e: false, mode: 0 });
      assert.equal(buffer.readUInt8(0), 0b00000001);
    });

  });

  describe('2 byte Encoder', function () {
    const dpt9 = tools.dptParse('DPT9');

    it('should encode DPT7 values', function () {
      const dpt = tools.dptParse('DPT7');
      buffer = enc.encode(dpt, 0);
      assert.equal(buffer.readUInt16BE(0), 0x0000);

      buffer = enc.encode(dpt, 2550);
      assert.equal(buffer.readUInt16BE(0), 0x09F6);

      buffer = enc.encode(dpt, 31247);
      assert.equal(buffer.readUInt16BE(0), 0x7A0F);

      buffer = enc.encode(dpt, 65535);
      assert.equal(buffer.readUInt16BE(0), 0xFFFF);
    });

    it('should encode DPT8 values', function () {
      const dpt = tools.dptParse('DPT8');
      buffer = enc.encode(dpt, -32);
      assert.equal(buffer.readUInt16BE(0), 0xFFE0);

      buffer = enc.encode(dpt, -32768);
      assert.equal(buffer.readUInt16BE(0), 0x8000);

      buffer = enc.encode(dpt, 32767);
      assert.equal(buffer.readUInt16BE(0), 0x7FFF);

      buffer = enc.encode(dpt, 127);
      assert.equal(buffer.readUInt16BE(0), 0x007F);
    });

    it('should encode DPT9 values', function () {
      buffer = enc.encode(dpt9, 40);
      assert.equal(buffer.readUInt16BE(0), 0x0FD0); // was: 0x13e8

      buffer = enc.encode(dpt9, 50);
      assert.equal(buffer.readUInt16BE(0), 0x14e2);
    });

    it('should encode DPT9 floating values', function () {
      buffer = enc.encode(dpt9, 20.2);
      assert.equal(buffer.readUInt16BE(0), 0x07E4); // was 0x11F9

      buffer = enc.encode(dpt9, 20.2);
      assert.equal(buffer.readUInt16BE(0), 0x07E4);
    });

    it('should encode DPT9 negative values', function () {
      buffer = enc.encode(dpt9, -100.32);
      assert.equal(buffer.readUInt16BE(0), 0x9B1A);

      buffer = enc.encode(dpt9, -175.84);
      assert.equal(buffer.readUInt16BE(0), 0xA3B5);

      buffer = enc.encode(dpt9, -199.52);
      assert.equal(buffer.readUInt16BE(0), 0xA321);

      buffer = enc.encode(dpt9, -200.32);
      assert.equal(buffer.readUInt16BE(0), 0xA31C); // was: 0xB6C7

      buffer = enc.encode(dpt9, -5.08);
      assert.equal(buffer.readUInt16BE(0), 0x8604);
    });

  });

  describe('3 byte Encoder', function () {

    it('should encode DPT10 values', function (done) {
      const dpt = tools.dptParse('DPT10');
      const dayOfTheWeek = 2; // Tuesday -> 010
      const hour = 10; // 10 AM  ->  01010
      const minutes = 43;
      const seconds = 5;
      const time = { hour: hour, minutes: minutes, seconds: seconds, day: dayOfTheWeek }
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

    it('should encode DPT11 values', function (done) {
      const dpt = tools.dptParse('DPT11');

      const day = 2; // February -> 010
      const month = 10; // 10 day  -> A
      const year = 14; // 14 -> 0xE -> 00001110

      buffer = enc.encode(dpt, new Date(2000 + year, month - 1, day));
      const value0 = buffer.readUInt8(0); // Read the first octect
      const value1 = buffer.readUInt8(1); // Read the second octect
      const value2 = buffer.readUInt8(2);  // Read the third octect

      assert.equal(value0, 0x02); // 00000010 = 2
      assert.equal(value1, 0x0A); // 10 = 00001010 = A
      assert.equal(value2, 0x0E); // 14 = 00001110 = 05

      done();
    });

  });

  describe('4 byte Encoder', function () {
    const dpt14 = tools.dptParse('DPT14');

    it('should encode DPT12 values', function () {
      const dpt = tools.dptParse('DPT12');
      buffer = enc.encode(dpt, 0);
      assert.equal(buffer.readUInt32BE(0), 0x00000000);

      buffer = enc.encode(dpt, 1233333333);
      assert.equal(buffer.readUInt32BE(0), 0x49832C55);

      buffer = enc.encode(dpt, 4294967295);
      assert.equal(buffer.readUInt32BE(0), 0xFFFFFFFF);

      buffer = enc.encode(dpt, 15);
      assert.equal(buffer.readUInt32BE(0), 0x0000000F);
    });

    it('should encode DPT13 values', function () {
      const dpt = tools.dptParse('DPT13');
      buffer = enc.encode(dpt, 0);
      assert.equal(buffer.readUInt32BE(0), 0x00000000);

      buffer = enc.encode(dpt, 2147483647);
      assert.equal(buffer.readUInt32BE(0), 0x7FFFFFFF);

      buffer = enc.encode(dpt, -2147483648);
      assert.equal(buffer.readUInt32BE(0), 0x80000000);

      buffer = enc.encode(dpt, -16);
      assert.equal(buffer.readUInt32BE(0), 0xFFFFFFF0);
    });

    it('should encode DPT14 values', function () {
      buffer = enc.encode(dpt14, 40);
      assert.equal(buffer.readUInt32BE(0), 0x42200000);

      buffer = enc.encode(dpt14, 35748613549);
      assert.equal(buffer.readUInt32BE(0), 0x51052C89);
    });

    it('should encode DPT14 floating values', function () {
      buffer = enc.encode(dpt14, 20.2);
      assert.equal(buffer.readUInt32BE(0), 0x41A1999A);

      buffer = enc.encode(dpt14, 423.2584);
      assert.equal(buffer.readUInt32BE(0), 0x43D3A113);
    });

    it('should encode DPT14 negative values', function () {
      buffer = enc.encode(dpt14, -8787.84);
      assert.equal(buffer.readUInt32BE(0), 0xC6094F5C);

      buffer = enc.encode(dpt14, -14);
      assert.equal(buffer.readUInt32BE(0), 0xC1600000);
    });

    it('should encode DPT15 values', function () {
      const dpt = tools.dptParse('DPT15');
      buffer = enc.encode(dpt, { accessCode: 123456, readError: false, permission: true, encryption: false, index: 13 });
      assert.equal(buffer.readUInt32BE(0), 0b00010010001101000101011001001101);

      buffer = enc.encode(dpt, { accessCode: 6789, readError: false, permission: false, readDirection: false, encryption: false, index: 14 });
      assert.equal(buffer.readUInt32BE(0), 0b00000000011001111000100100001110);
    });

  });
});
