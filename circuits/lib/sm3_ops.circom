pragma circom 2.1.8;

include "./word_ops.circom";

template P0() {
    signal input in[32];
    signal output out[32];

    component rot9 = RotL32(9);
    component rot17 = RotL32(17);
    component xor3 = BitwiseXor3_32();

    for (var i = 0; i < 32; i++) {
        rot9.in[i] <== in[i];
        rot17.in[i] <== in[i];
    }

    for (var i = 0; i < 32; i++) {
        xor3.a[i] <== in[i];
        xor3.b[i] <== rot9.out[i];
        xor3.c[i] <== rot17.out[i];
    }

    for (var i = 0; i < 32; i++) {
        out[i] <== xor3.out[i];
    }
}

template P1() {
    signal input in[32];
    signal output out[32];

    component rot15 = RotL32(15);
    component rot23 = RotL32(23);
    component xor3 = BitwiseXor3_32();

    for (var i = 0; i < 32; i++) {
        rot15.in[i] <== in[i];
        rot23.in[i] <== in[i];
    }

    for (var i = 0; i < 32; i++) {
        xor3.a[i] <== in[i];
        xor3.b[i] <== rot15.out[i];
        xor3.c[i] <== rot23.out[i];
    }

    for (var i = 0; i < 32; i++) {
        out[i] <== xor3.out[i];
    }
}

template FF(roundIdx) {
    signal input x[32];
    signal input y[32];
    signal input z[32];
    signal output out[32];

    if (roundIdx < 16) {
        component low = BitwiseXor3_32();
        for (var i = 0; i < 32; i++) {
            low.a[i] <== x[i];
            low.b[i] <== y[i];
            low.c[i] <== z[i];
        }
        for (var i = 0; i < 32; i++) {
            out[i] <== low.out[i];
        }
    } else {
        component high = Majority32();
        for (var i = 0; i < 32; i++) {
            high.a[i] <== x[i];
            high.b[i] <== y[i];
            high.c[i] <== z[i];
        }
        for (var i = 0; i < 32; i++) {
            out[i] <== high.out[i];
        }
    }
}

template GG(roundIdx) {
    signal input x[32];
    signal input y[32];
    signal input z[32];
    signal output out[32];

    if (roundIdx < 16) {
        component low = BitwiseXor3_32();
        for (var i = 0; i < 32; i++) {
            low.a[i] <== x[i];
            low.b[i] <== y[i];
            low.c[i] <== z[i];
        }
        for (var i = 0; i < 32; i++) {
            out[i] <== low.out[i];
        }
    } else {
        component high = Choose32();
        for (var i = 0; i < 32; i++) {
            high.a[i] <== x[i];
            high.b[i] <== y[i];
            high.c[i] <== z[i];
        }
        for (var i = 0; i < 32; i++) {
            out[i] <== high.out[i];
        }
    }
}
