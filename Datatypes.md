Expected data formats for supported DPTs

DPT 1: {boolean}

DPT 2: Object { control: {boolean}, value: {boolean} }

DPT 3: Object { control: {boolean}, step: {number} }
    StepCode 0..7 (0: Break) - 3-bit UInt
    Number of intervals = 2^(step-1)
    higher number -> slower dimming / movement

DPT 4: Object { subType: {number}, char: {string} }
    subType 1: DPT4.001 ASCII / 2: DPT4.002 UTF8

DPT 5: {number}
    0..255
DPT 5.001: {number}
    0..100 percent
DPT 5.010: {number}
    0..360 degree angle

DPT 6: {number}
    -128..127
DPT 6.020: Object { a: {boolean}, b: {boolean}, c: {boolean}, d: {boolean}, e: {boolean}, mode: {number} };
    a,b,c,d,e: false: set / true: clear
    mode: 0..2

DPT 7: {number}
    0..65535

DPT 8: {number}
    -32768..32768

DPT 9: {number}
    -671088.64..670760.96

DPT 10: Object { hour: {number}, minutes: {number}, seconds: {number}, day?: {number} }
    day: 0: no day, 1: Monday, 7: Sunday

DPT 11: Date {year, month, date}
    
DPT 12: {number}
    0...4 294 967 295

DPT 13: {number}
    -2 147 483 648 ... 2 147 483 647

DPT 14: {number}
    32-bit Float

DPT 15: Object { accessCode: {number}, readError: {boolean}, permission: {boolean}, readDirection?: {boolean}, encryption: {boolean}, index: {number} }
    accessCode: 0...999999
    readError: 0: no Error, 1: reading code not successfull
    permission: 0: not accepted, 1: accepted
    readDirection: 0: left to right (default), 1: right to left
    encryption: 0: no, 1: yes
    index: 0...15 Index of access identification code (future use)
