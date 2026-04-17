pragma circom 2.1.8;

include "./lib/bits.circom";
include "./lib/word_ops.circom";
include "./lib/addition.circom";
include "./lib/sm3_ops.circom";

function rotlConst32(value, shift) {
    var s = shift % 32;
    var modulus = 4294967296;
    if (s == 0) {
        return value % modulus;
    }
    return (((value << s) % modulus) + (value >> (32 - s))) % modulus;
}

template SM3CompressionBlock() {
    signal input block_bits[512];
    signal input state_in[8][32];
    signal output state_out[8][32];

    signal w[68][32];
    signal wp[64][32];

    signal a[65][32];
    signal b[65][32];
    signal c[65][32];
    signal d[65][32];
    signal e[65][32];
    signal f[65][32];
    signal g[65][32];
    signal h[65][32];

    for (var word = 0; word < 16; word++) {
        for (var bit = 0; bit < 32; bit++) {
            // Circuit input bits are big-endian within each 32-bit SM3 word.
            w[word][bit] <== block_bits[word * 32 + (31 - bit)];
        }
    }

    component expandRot15[52];
    component expandXorSeed[52];
    component expandP1[52];
    component expandRot7[52];
    component expandXorMid[52];
    component expandXorOut[52];

    for (var idx = 16; idx < 68; idx++) {
        var k = idx - 16;

        expandRot15[k] = RotL32(15);
        expandXorSeed[k] = BitwiseXor3_32();
        expandP1[k] = P1();
        expandRot7[k] = RotL32(7);
        expandXorMid[k] = BitwiseXor32();
        expandXorOut[k] = BitwiseXor32();

        for (var bit = 0; bit < 32; bit++) {
            expandRot15[k].in[bit] <== w[idx - 3][bit];

            expandXorSeed[k].a[bit] <== w[idx - 16][bit];
            expandXorSeed[k].b[bit] <== w[idx - 9][bit];
            expandXorSeed[k].c[bit] <== expandRot15[k].out[bit];

            expandP1[k].in[bit] <== expandXorSeed[k].out[bit];

            expandRot7[k].in[bit] <== w[idx - 13][bit];

            expandXorMid[k].a[bit] <== expandP1[k].out[bit];
            expandXorMid[k].b[bit] <== expandRot7[k].out[bit];

            expandXorOut[k].a[bit] <== expandXorMid[k].out[bit];
            expandXorOut[k].b[bit] <== w[idx - 6][bit];

            w[idx][bit] <== expandXorOut[k].out[bit];
        }
    }

    component wpXor[64];
    for (var idx = 0; idx < 64; idx++) {
        wpXor[idx] = BitwiseXor32();
        for (var bit = 0; bit < 32; bit++) {
            wpXor[idx].a[bit] <== w[idx][bit];
            wpXor[idx].b[bit] <== w[idx + 4][bit];
            wp[idx][bit] <== wpXor[idx].out[bit];
        }
    }

    for (var bit = 0; bit < 32; bit++) {
        a[0][bit] <== state_in[0][bit];
        b[0][bit] <== state_in[1][bit];
        c[0][bit] <== state_in[2][bit];
        d[0][bit] <== state_in[3][bit];
        e[0][bit] <== state_in[4][bit];
        f[0][bit] <== state_in[5][bit];
        g[0][bit] <== state_in[6][bit];
        h[0][bit] <== state_in[7][bit];
    }

    signal rotatedT[64][32];
    for (var round = 0; round < 64; round++) {
        var tVal = 0x79CC4519;
        if (round >= 16) {
            tVal = 0x7A879D8A;
        }
        var tRot = rotlConst32(tVal, round);
        for (var bit = 0; bit < 32; bit++) {
            rotatedT[round][bit] <== (tRot >> bit) & 1;
        }
    }

    component rotA12[64];
    component ss1Add[64];
    component ss1Rot[64];
    component ss2Xor[64];
    component ffRound[64];
    component ggRound[64];
    component tt1Add[64];
    component tt2Add[64];
    component rotB9[64];
    component rotF19[64];
    component tt2P0[64];

    for (var round = 0; round < 64; round++) {
        rotA12[round] = RotL32(12);
        ss1Add[round] = AddMod32(3, 34);
        ss1Rot[round] = RotL32(7);
        ss2Xor[round] = BitwiseXor32();
        ffRound[round] = FF(round);
        ggRound[round] = GG(round);
        tt1Add[round] = AddMod32(4, 34);
        tt2Add[round] = AddMod32(4, 34);
        rotB9[round] = RotL32(9);
        rotF19[round] = RotL32(19);
        tt2P0[round] = P0();

        for (var bit = 0; bit < 32; bit++) {
            rotA12[round].in[bit] <== a[round][bit];

            ss1Add[round].in[0][bit] <== rotA12[round].out[bit];
            ss1Add[round].in[1][bit] <== e[round][bit];
            ss1Add[round].in[2][bit] <== rotatedT[round][bit];

            ss1Rot[round].in[bit] <== ss1Add[round].out[bit];

            ss2Xor[round].a[bit] <== ss1Rot[round].out[bit];
            ss2Xor[round].b[bit] <== rotA12[round].out[bit];

            ffRound[round].x[bit] <== a[round][bit];
            ffRound[round].y[bit] <== b[round][bit];
            ffRound[round].z[bit] <== c[round][bit];

            ggRound[round].x[bit] <== e[round][bit];
            ggRound[round].y[bit] <== f[round][bit];
            ggRound[round].z[bit] <== g[round][bit];

            tt1Add[round].in[0][bit] <== ffRound[round].out[bit];
            tt1Add[round].in[1][bit] <== d[round][bit];
            tt1Add[round].in[2][bit] <== ss2Xor[round].out[bit];
            tt1Add[round].in[3][bit] <== wp[round][bit];

            tt2Add[round].in[0][bit] <== ggRound[round].out[bit];
            tt2Add[round].in[1][bit] <== h[round][bit];
            tt2Add[round].in[2][bit] <== ss1Rot[round].out[bit];
            tt2Add[round].in[3][bit] <== w[round][bit];

            rotB9[round].in[bit] <== b[round][bit];
            rotF19[round].in[bit] <== f[round][bit];
            tt2P0[round].in[bit] <== tt2Add[round].out[bit];

            a[round + 1][bit] <== tt1Add[round].out[bit];
            b[round + 1][bit] <== a[round][bit];
            c[round + 1][bit] <== rotB9[round].out[bit];
            d[round + 1][bit] <== c[round][bit];
            e[round + 1][bit] <== tt2P0[round].out[bit];
            f[round + 1][bit] <== e[round][bit];
            g[round + 1][bit] <== rotF19[round].out[bit];
            h[round + 1][bit] <== g[round][bit];
        }
    }

    component finalWordXor[8];
    for (var word = 0; word < 8; word++) {
        finalWordXor[word] = BitwiseXor32();
    }

    for (var bit = 0; bit < 32; bit++) {
        finalWordXor[0].a[bit] <== a[64][bit];
        finalWordXor[0].b[bit] <== state_in[0][bit];
        finalWordXor[1].a[bit] <== b[64][bit];
        finalWordXor[1].b[bit] <== state_in[1][bit];
        finalWordXor[2].a[bit] <== c[64][bit];
        finalWordXor[2].b[bit] <== state_in[2][bit];
        finalWordXor[3].a[bit] <== d[64][bit];
        finalWordXor[3].b[bit] <== state_in[3][bit];
        finalWordXor[4].a[bit] <== e[64][bit];
        finalWordXor[4].b[bit] <== state_in[4][bit];
        finalWordXor[5].a[bit] <== f[64][bit];
        finalWordXor[5].b[bit] <== state_in[5][bit];
        finalWordXor[6].a[bit] <== g[64][bit];
        finalWordXor[6].b[bit] <== state_in[6][bit];
        finalWordXor[7].a[bit] <== h[64][bit];
        finalWordXor[7].b[bit] <== state_in[7][bit];

        state_out[0][bit] <== finalWordXor[0].out[bit];
        state_out[1][bit] <== finalWordXor[1].out[bit];
        state_out[2][bit] <== finalWordXor[2].out[bit];
        state_out[3][bit] <== finalWordXor[3].out[bit];
        state_out[4][bit] <== finalWordXor[4].out[bit];
        state_out[5][bit] <== finalWordXor[5].out[bit];
        state_out[6][bit] <== finalWordXor[6].out[bit];
        state_out[7][bit] <== finalWordXor[7].out[bit];
    }
}

template SM3MultiBlock(maxBlocks) {
    signal input preimage_bits[maxBlocks * 512];
    signal input active_mask[maxBlocks];
    signal input expected_hash_words[8];

    signal state[maxBlocks + 1][8][32];

    var iv[8];
    iv[0] = 0x7380166F;
    iv[1] = 0x4914B2B9;
    iv[2] = 0x172442D7;
    iv[3] = 0xDA8A0600;
    iv[4] = 0xA96F30BC;
    iv[5] = 0x163138AA;
    iv[6] = 0xE38DEE4D;
    iv[7] = 0xB0FB0E4E;

    for (var word = 0; word < 8; word++) {
        for (var bit = 0; bit < 32; bit++) {
            state[0][word][bit] <== (iv[word] >> bit) & 1;
        }
    }

    component blocks[maxBlocks];
    active_mask[0] === 1;

    for (var block = 0; block < maxBlocks; block++) {
        active_mask[block] * (active_mask[block] - 1) === 0;
        if (block > 0) {
            active_mask[block] * (1 - active_mask[block - 1]) === 0;
        }

        blocks[block] = SM3CompressionBlock();

        for (var bit = 0; bit < 512; bit++) {
            blocks[block].block_bits[bit] <== preimage_bits[(block * 512) + bit];
        }

        for (var word = 0; word < 8; word++) {
            for (var bit = 0; bit < 32; bit++) {
                blocks[block].state_in[word][bit] <== state[block][word][bit];
                state[block + 1][word][bit] <==
                    state[block][word][bit]
                    + active_mask[block] * (blocks[block].state_out[word][bit] - state[block][word][bit]);
            }
        }
    }

    component expectedHashBits[8];
    for (var word = 0; word < 8; word++) {
        expectedHashBits[word] = Num2BitsStrict(32);
        expectedHashBits[word].in <== expected_hash_words[word];
        for (var bit = 0; bit < 32; bit++) {
            state[maxBlocks][word][bit] === expectedHashBits[word].out[bit];
        }
    }
}

component main {public [expected_hash_words]} = SM3MultiBlock(4);
