'use strict';

/**
 * Implements decode methods for dpt types
 */
function Decoder() {
}

/**
 * decode dpt 1 values
 * @returns {boolean}
 */
Decoder.prototype.decodeDPT1 = function(buffer) {
  const numericBool = buffer.readUInt8(0) & 0b1;
  return !! numericBool;
};

/**
 * decode eis 8 / dpt 2 values
 * @returns {Object} dpt2 object - propertys: control {boolean}, value {boolean}
 */
Decoder.prototype.decodeDPT2 = function(buffer) {
  const c = buffer.readUInt8(0) >>> 1 & 0b1;
  const v = buffer.readUInt8(0) & 0b1;
  return {control: !! c, value: !! v};
};

/**
 * decode eis 2 / dpt 3 values
 * @returns {Object} dpt3 object - propertys: control {boolean}, step {number}
 */
Decoder.prototype.decodeDPT3 = function(buffer) {
  const c = buffer.readUInt8(0) >>> 3 & 0b1;
  const s = buffer.readUInt8(0) & 0b111;
  return {control: !! c, step: s};
};

/**
 * decode eis 13 / dpt 4 values
 * @param {Object} obj dpt 4 object - propertys: subType {number}, char {string}
 */
Decoder.prototype.decodeDPT4_001 = function(buffer) {
  return buffer.toString('ascii', 0);
};
Decoder.prototype.decodeDPT4_002 = function(buffer) {
  return buffer.toString('utf8', 0);
};

/**
 * decode eis 14 / dpt 5 values
 */
Decoder.prototype.decodeDPT5 = function(buffer) {
  return buffer.readUInt8(0);
};

/**
 * decode eis 14 / dpt 6 values
 */
Decoder.prototype.decodeDPT6 = function(buffer) {
  return buffer.readInt8(0);
};

/**
 * decode EIS 10 / dpt 7 values
 */
Decoder.prototype.decodeDPT7 = function(buffer) {
  return buffer.readUInt16BE(0);
};

/**
 * decode EIS 10.001 / dpt 8 values
 */
Decoder.prototype.decodeDPT8 = function(buffer) {
  return buffer.readInt16BE(0);
};

/**
 * Decode eis 5 / dpt 9 values.
 * From the specs: FloatValue = (0,01M)2^E
 * - E = 0,15
 * - M = -2048,2047
 */
Decoder.prototype.decodeDPT9 = function(buffer) {
  var value = buffer.readUInt16BE(0);

  var sign = (value & 0x8000) >> 15;
  var exp = (value & 0x7800) >> 11;
  var mant = (value & 0x07ff);

  if(sign !== 0) {
    mant = -(~(mant - 1) & 0x07ff);
  }
  return 0.01 * mant * Math.pow(2,exp);
};

/**
 * decode eis 3 / dpt 10 values
 */
Decoder.prototype.decodeDPT10 = function(buffer) {

  var value = new Date();

  var weekDay = (buffer[0] & 0xe0) >> 5;
  var hour = buffer[0] & 0x1f;
  var min = buffer[1] & 0x3f;
  var sec = buffer[2] & 0x3f;

  value.setHours(hour);
  value.setMinutes(min);
  value.setSecondes(sec);
  var currentDay = value.getDay();
  if(currentDay !== weekDay) {
    if(currentDay > weekDay) {
      value.setDate(value.getDate() + (weekDay - currentDay));
    } else {
      value.setDate(value.getDate() - (weekDay - currentDay));
    }
  }
  return value;
};

/**
 * decode eis 4 / dpt 11 values
 */
Decoder.prototype.decodeDPT11 = function(buffer) {
  const day = buffer[0] & 0x1f;
  const mon = buffer[1] & 0xf;
  let year = buffer[2] & 0x7f;

  if(year < 90) {
    year += 2000;
  } else {
    year += 1900;
  }

  return new Date(year, mon, day);
};

/**
 * decode eis 11 / dpt 12 values
 */
Decoder.prototype.decodeDPT12 = function(buffer) {
  return buffer.readUInt32BE(0);
};

/**
 * decode eis 11.001 / dpt 13 values
 */
Decoder.prototype.decodeDPT13 = function(buffer) {
  return buffer.readInt32BE(0);
};

/**
 * decode eis 9 / dpt 14 values
 */
Decoder.prototype.decodeDPT14 = function(buffer) {
  return buffer.readFloatBE(0);
};

Decoder.prototype.decodeDPT16 = function(buffer) {
  let value = "";
  for(let i = 0; i < buffer.length; i++) {
    value += String.fromCharCode(buffer.readUInt8(i));
  }
  return value;
};

Decoder.prototype.decodeDPT232 = function(buffer) {
  //[red, green, blue]
  return [buffer[2], buffer[1], buffer[0]]
};

/**
 * decode value
 */
Decoder.prototype.decode = function(len, data, callback) {

  var err = null;
  var type = 'UNKN';
  var value = null;

  // eis 1 / dpt 1.xxx
  if(len === 8) {
    type = 'DPT1';
    value = this.decodeDPT1(data);
  }

  // eis 6 / dpt 5.xxx
  // assumption
  if(len === 9){
    type = 'DPT5';
    if(data.length === 1) {
      value = this.decodeDPT5(data);
    } else {
      err = new Error('Invalid data len for DPT5');
    }
  }

  // eis 5 / dpt 9.xxx
  // assumption
  if(len === 10) {
    type = 'DPT9';
    if(data.length === 2) {
      value = this.decodeDPT9(data);
    }
    else {
      err = new Error('Invalid data len for DPT9');
    }
  }

  //If still unkown take the raw Buffer
  if(type === 'UNKN') {
    value = data;
  }

  if(callback) {
      callback(err, type, value);
  }
};

/**
 * decode value for given DPT
 * mainDPT is only main type without dot (eg. 'DPT7') 
 * data is expected to be a Buffer
 */
Decoder.prototype.decodeAs = function( {main: mainDpt, sub: subDpt}, data, callback ) {
  const len = data.length;
  let self = this;
  let value = null;
  let err = null;

  let {decoder: decodeDPT, size: dptSize} = (function(mainDpt, subDpt){
    switch(mainDpt) {
      // size in byte
      case 1:
        return {decoder: self.decodeDPT1, size: 1};
      case 2:
        return {decoder: self.decodeDPT2, size: 1};
      case 3:
        return {decoder: self.decodeDPT3, size: 1};
      case 4:
        switch(subDpt) {
          case 1:
            return {decoder: self.decodeDPT4_001, size: 1};
          case 2:
            return {decoder: self.decodeDPT4_002, size: 1};
          default: 
            return {decoder: 'subtype required', size: null}; 
        }
      case 5:
        return {decoder: self.decodeDPT5, size: 1};
      case 6:
        return {decoder: self.decodeDPT6, size: 1};
      case 7:
        return {decoder: self.decodeDPT7, size: 2};
      case 8:
        return {decoder: self.decodeDPT8, size: 2};
      case 9:
        return {decoder: self.decodeDPT9, size: 2};
      case 10:
        return {decoder: self.decodeDPT10, size: 3};
      case 11:
        return {decoder: self.decodeDPT11, size: 3};
      case 12:
        return {decoder: self.decodeDPT12, size: 4};
      case 13:
        return {decoder: self.decodeDPT13, size: 4};
      case 14:
        return {decoder: self.decodeDPT14, size: 4};
      case 16:
        return {decoder: self.decodeDPT16, size: 14};
      case 232:
        return {decoder: self.decodeDPT232, size: 3};
      default:
        return {decoder: null, size: null};
    };
  })(mainDpt, subDpt);

  if(len === dptSize) {
    value = decodeDPT(data);
  } else if(decodeDPT === 'subtype required') {
    err = new Error('DPT subtype required: ' + mainDpt);
  } else if(decodeDPT === null) {
    err = new Error('Unknown DPT declaration: ' + mainDpt + '.' + subDpt);
  } else {
    err = new Error('Mismatching DPT declaration and data length');
  }

  if(callback){
    callback(err, 'DPT'+mainDpt, value);
  }
};

module.exports = Decoder;
