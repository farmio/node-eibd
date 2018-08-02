'use strict';

var Encoder = require('./encoder');
const tools = require('./tools');

function createMessage(messageAction, DPTType, value) {
  DPTType = DPTType || '';
  let data = Buffer.alloc(2);

  if(messageAction === 'read') {
    //Read message - first byte 0 (from Buffer.alloc)
  } else {
    const dpt = tools.dptParse(DPTType);
    const payload = new Encoder().encode(dpt, value);
    //first Byte 64 for response; first Byte 128 for write
    const firstByte = (messageAction === 'response') ? 64 : 128;

    if ( dpt.main === 1
      || dpt.main === 2
      || dpt.main === 3 ) {
        //Small payload to OR with action
        data.writeUInt8(firstByte | payload.readUInt8(0) , 1);
   } else {
    //Big payload to append
    data.writeUInt8(firstByte,1);
    data = Buffer.concat([data, payload]);
   }
  }

  return Array.prototype.slice.call(data, 0);
}

module.exports = createMessage;
