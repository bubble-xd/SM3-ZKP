pragma circom 2.1.8;

template RotL32(shift) {
    signal input in[32];
    signal output out[32];

    for (var i = 0; i < 32; i++) {
        out[i] <== in[(i + 32 - shift) % 32];
    }
}

template BitwiseNot32() {
    signal input in[32];
    signal output out[32];

    for (var i = 0; i < 32; i++) {
        out[i] <== 1 - in[i];
    }
}

template BitwiseAnd32() {
    signal input a[32];
    signal input b[32];
    signal output out[32];

    for (var i = 0; i < 32; i++) {
        out[i] <== a[i] * b[i];
    }
}

template BitwiseXor32() {
    signal input a[32];
    signal input b[32];
    signal output out[32];

    for (var i = 0; i < 32; i++) {
        out[i] <== a[i] + b[i] - 2 * a[i] * b[i];
    }
}

template BitwiseXor3_32() {
    signal input a[32];
    signal input b[32];
    signal input c[32];
    signal output out[32];

    signal tmp[32];

    for (var i = 0; i < 32; i++) {
        tmp[i] <== a[i] + b[i] - 2 * a[i] * b[i];
        out[i] <== tmp[i] + c[i] - 2 * tmp[i] * c[i];
    }
}

template Majority32() {
    signal input a[32];
    signal input b[32];
    signal input c[32];
    signal output out[32];

    signal ab[32];
    signal ac[32];
    signal bc[32];
    signal abc[32];

    for (var i = 0; i < 32; i++) {
        ab[i] <== a[i] * b[i];
        ac[i] <== a[i] * c[i];
        bc[i] <== b[i] * c[i];
        abc[i] <== ab[i] * c[i];
        out[i] <== ab[i] + ac[i] + bc[i] - 2 * abc[i];
    }
}

template Choose32() {
    signal input a[32];
    signal input b[32];
    signal input c[32];
    signal output out[32];

    for (var i = 0; i < 32; i++) {
        out[i] <== c[i] + a[i] * (b[i] - c[i]);
    }
}

