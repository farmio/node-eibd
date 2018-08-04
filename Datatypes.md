Expected data formats for supported DPTs

DPT 1: boolean

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

DPT 8:
    