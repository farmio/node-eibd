'use strict';

const tools = require('./tools');

/**
 * Implements encode methods for dpt types
 */
function Encoder() {
}

/**
 * encode dpt 1 values
 */
Encoder.prototype.encodeDPT1 = function(value) {
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value & 0b1, 0);
  return buffer;
};

/**
 * encode dpt 2 values
 * @param {Object} obj dpt 2 object
 * @param {boolean} obj.control Control / No control
 * @param {boolean} obj.value Function value
 */
Encoder.prototype.encodeDPT2 = function(obj) {
  const buffer = Buffer.alloc(1);
  const c = obj.control & 0b1;
  const v = obj.value & 0b1;
  buffer.writeUInt8(c << 1 | v, 0);
  return buffer;
};

/**
 * encode dpt 3 values
 * @param {Object} obj dpt 3 object
 * @param {boolean} obj.control Decrease, Up / Increase, Down
 * @param {number} obj.step StepCode Intervals 0..7 (0: Break) - 3-bit UInt
 */
Encoder.prototype.encodeDPT3 = function(obj) {
  const buffer = Buffer.alloc(1);
  const c = obj.control & 0b1;
  const s = obj.step & 0b111;
  buffer.writeUInt8(c << 3 | s, 0);
  return buffer;
};

/**
 * encode eis 13 / dpt 4 values
 */
Encoder.prototype.encodeDPT4_001 = function(char) {
    const buffer = Buffer.alloc(1);
    // most significant bit shall always be 0
    const ascii = char.charCodeAt() & 0b1111111;
    buffer.writeUInt8(ascii);
    return buffer;
};
Encoder.prototype.encodeDPT4_002 = function(char) {
    const buffer = Buffer.alloc(1);
    const iso_8859_1 = char.charCodeAt() & 0xFF;
    buffer.writeUInt8(iso_8859_1);
    return buffer;
};

/**
 * encode dpt 5 values
 */
Encoder.prototype.encodeDPT5 = function(value) {
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value & 0xFF, 0);
  return buffer;
};
Encoder.prototype.encodeDPT5_001 = function(value) {
    const buffer = Buffer.alloc(1);
    const percent = ((value <= 100) ? ((value >= 0) ? value : 0)  : 100) * 255 / 100;
    buffer.writeUInt8(percent & 0xFF, 0);
    return buffer;
};
Encoder.prototype.encodeDPT5_002 = function(value) {
    const buffer = Buffer.alloc(1);
    const angle = ((value <= 360) ? ((value >= 0) ? value : 0)  : 360) * 255 / 360;
    buffer.writeUInt8(Math.round(angle) & 0xFF, 0);
    return buffer;
};

/**
 * encode dpt 6 values
 */
Encoder.prototype.encodeDPT6 = function(value) {
    const buffer = Buffer.alloc(1);
    const signedRelative = ((value <= 127) ? ((value >= -128) ? value : -128) : 127);
    buffer.writeInt8(signedRelative, 0);
    return buffer;
};
Encoder.prototype.encodeDPT6_020 = function(obj) {
    const buffer = Buffer.alloc(1);
    let status = (obj.a << 7)
               | (obj.b << 6)
               | (obj.c << 5)
               | (obj.d << 4)
               | (obj.e << 3);
    const mode = (obj.mode == 0) ? 0b001
               : (obj.mode == 1) ? 0b010 
               : (obj.mode == 2) ? 0b100 
               : 0b000;
    buffer.writeUInt8(status | mode);
    return buffer;
};

/**
 * encode dpt 7 values
 */
Encoder.prototype.encodeDPT7 = function(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16BE(value, 0);
  return buffer;
};

/**
 * encode dpt 8 values
 */
Encoder.prototype.encodeDPT8 = function(value) {
    const buffer = Buffer.alloc(2);
    buffer.writeInt16BE(value, 0);
    return buffer;
  };

/**
 * encode 9 values
 */
Encoder.prototype.encodeDPT9 = function(value) {
  let data = [0,0];
  // Reverse of the formula: FloatValue = (0,01M)2^E
  let exp = Math.floor(Math.max(Math.log(Math.abs(value)*100)/Math.log(2)-10, 0));
  let mant = value * 100 / (1 << exp);

  //Fill in sign bit
  if(value < 0) {
    data[0] |= 0x80;
    mant = (~(mant * -1) + 1) & 0x07ff;
  }

  //Fill in exp (4bit)
  data[0] |= (exp & 0x0F) << 3;

  //Fill in mant
  data[0] |= (mant >> 8) & 0x7;
  data[1] |= mant & 0xFF;

  const buffer = Buffer.alloc(2);
  buffer.writeUInt8(data[0], 0);
  buffer.writeUInt8(data[1], 1);
  return buffer;
};

/**
 * Encode DTP-10 values.
 * @param {Object} time containing hour, minutes, seconds, day
 * @param {number} time.hour
 * @param {number} time.minutes
 * @param {number} time.seconds
 * @param {number} time.day optional
 * TIME: 10.001 (PDT_TIME).
 *
 * For time:
 * 3 bits for day of week (0 = none; 1 = Monday ; ...; 7 = Sunday)
 * 5 bits for hour (00-23)
 * ---- byte 1
 * 2 bits ZERO as padding
 * 6 bits for minutes (00-59)
 * ---- byte 2
 * 2 bits ZERO as padding
 * 6 bits for seconds (00-59)
 * ---- byte 3
 * 3 octets: N3U5 - r2U6 - r2U6
 */
Encoder.prototype.encodeDPT10 = function(time) {
    const buffer = Buffer.alloc(3);
    const d = time.day;
    const dh = ( (d >= 1 && d <= 7) ? d : 0 ) << 5 // convert the day (mask 3 bits) and shift to left fot 5 bits
             | (time.hour & 0x1F); // convert the hour (mask 5 bits)
    buffer.writeUInt8(dh, 0);
    buffer.writeUInt8(time.minutes & 0x3F, 1); // convert minutes (mask 6 bits)
    buffer.writeUInt8(time.seconds & 0x3F, 2); // convert seconds (mask 6 bits)
    return buffer;
};

/**
 * Encode DTP-11 values.
 * @param {Date} date containing year, month and day
 */
Encoder.prototype.encodeDPT11 = function(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() % 100; // only last 2 digits of year

    const buffer = Buffer.alloc(3);
    buffer.writeUInt8(day & 0b11111, 0);
    buffer.writeUInt8(month & 0b1111, 1);
    buffer.writeUInt8(year & 0b1111111, 2);
    return buffer;
};

/**
 * encode dpt 12 values
 */
Encoder.prototype.encodeDPT12 = function(value) {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value, 0);
    return buffer;
};

/**
 * encode dpt 13 values
 */
Encoder.prototype.encodeDPT13 = function(value) {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32BE(value, 0);
    return buffer;
};

/**
 * encode dpt 14 values
 */
Encoder.prototype.encodeDPT14 = function(value) {
    const buffer = Buffer.alloc(4);
    buffer.writeFloatBE(value, 0);
    return buffer;
};

/**
 * encode dpt 15 values
 * { accessCode: {number}, readError: {boolean}, permission: {boolean}, readDirection?: {boolean}, encryption: {boolean}, index: {number} }
 * @param {Object} obj dpt 15 object
 * @param {number} obj.accessCode 
 * @param {boolean} obj.readError 
 * @param {boolean} obj.permission
 * @param {boolean} obj.readDirection optional - defaults to 0
 * @param {boolean} obj.encryption
 * @param {number} obj.index
 */
Encoder.prototype.encodeDPT15 = function(obj) {
    const buffer = Buffer.alloc(4);
    
    let code = 0;
    for (let pos = 0; pos < 6; pos++) {
        const digit = Math.floor((obj.accessCode / Math.pow(10, pos)) % 10);
        code |= (digit << (pos * 4));
    }
    buffer.writeUIntBE(code, 0, 3);

    const data = (obj.readError << 7)
               | (obj.permission << 6)
               | (((obj.readDirection & 0b1) ? 1 : 0 ) << 5)
               | (obj.encryption << 4)
               | (obj.index & 0xF)
    buffer.writeUInt8(data, 3)

    return buffer;
};

Encoder.prototype.encode = function(dpt, value) {
    switch( dpt.main ) {
        case 1:
            return this.encodeDPT1(value);
        case 2:
            return this.encodeDPT2(value);
        case 3:
            return this.encodeDPT3(value);
        case 4:
            switch(dpt.sub) {
                case 1:
                    return this.encodeDPT4_001(value);
                case 2:
                    return this.encodeDPT4_002(value);
                default:
                    return undefined;
            }
        case 5:
            switch(dpt.sub) {
                case 1:
                    return this.encodeDPT5_001(value);
                case 2:
                    return this.encodeDPT5_002(value);
                default:
                    return this.encodeDPT5(value);;
            }
        case 6:
            switch(dpt.sub) {
                case 20:
                    return this.encodeDPT6_020(value);
                default:
                    return this.encodeDPT6(value);;
            }
        case 7:
            return this.encodeDPT7(value);
        case 8:
            return this.encodeDPT8(value);
        case 9:
            return this.encodeDPT9(value);
        case 10:
            return this.encodeDPT10(value);
        case 11:
            return this.encodeDPT11(value);
        case 12:
            return this.encodeDPT12(value);
        case 13:
            return this.encodeDPT13(value);
        case 14:
            return this.encodeDPT14(value);
        case 15:
            return this.encodeDPT15(value);
        default:
            return undefined;
    }
};

module.exports = Encoder;
