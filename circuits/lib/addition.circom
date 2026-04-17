pragma circom 2.1.8;

include "./bits.circom";

template AddMod32(n, width) {
    signal input in[n][32];
    signal output out[32];

    component packers[n];
    signal partial[n + 1];

    partial[0] <== 0;

    for (var i = 0; i < n; i++) {
        packers[i] = Bits2Num(32);
        for (var bit = 0; bit < 32; bit++) {
            packers[i].in[bit] <== in[i][bit];
        }
        partial[i + 1] <== partial[i] + packers[i].out;
    }

    component reduced = Num2BitsStrict(width);
    reduced.in <== partial[n];

    for (var i = 0; i < 32; i++) {
        out[i] <== reduced.out[i];
    }
}

