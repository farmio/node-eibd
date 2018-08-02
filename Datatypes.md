Expected data formats for supported DPTs

DPT 1: boolean

DPT 2: Object { control: {boolean}, value: {boolean} }

DPT 3: Object { control: {boolean}, step: {number} }
    StepCode 0..7 (0: Break) - 3-bit UInt
    Number of intervals = 2^(step-1)
    higher number -> slower dimming / movement

DPT 4: Object { subType: {number}, char: {string} }
    subType 1: DPT4.001 ASCII / 2: DPT4.002 UTF8

