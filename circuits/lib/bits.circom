pragma circom 2.1.8;

template Num2BitsStrict(n) {
    signal input in;
    signal output out[n];

    var lc = 0;
    var coeff = 1;

    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc += out[i] * coeff;
        coeff += coeff;
    }

    lc === in;
}

template Bits2Num(n) {
    signal input in[n];
    signal output out;

    var lc = 0;
    var coeff = 1;

    for (var i = 0; i < n; i++) {
        lc += in[i] * coeff;
        coeff += coeff;
    }

    out <== lc;
}

template AssertBitArray(n) {
    signal input left[n];
    signal input right[n];

    for (var i = 0; i < n; i++) {
        left[i] === right[i];
    }
}

