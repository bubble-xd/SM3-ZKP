# SM3 与零知识证明融合技术方案(详细版)

> 目标:把 SM3 哈希算法转化为零知识证明可计算的算术电路,实现 **"证明我知道某个 x 满足 SM3(x) = H,但不泄露 x"**。

---

## 一、方案总览:为什么这个融合有难度

### 1.1 核心矛盾

SM3 是**位运算密集型**算法(XOR、AND、循环移位、32位模加),而 zkSNARK(Groth16/PLONK)工作在**大素数有限域 F_p** 上,原生只支持加法和乘法。

两者的"语言"不同,必须把 SM3 的每一个操作翻译为若干个形如 `a·b = c` 的**R1CS 约束**(Rank-1 Constraint System)。**每个约束就是电路的一个"门"**,约束越多,证明生成越慢、内存占用越高。

PPT 里提到的"32,836 门 / 69,730 门"就是指 R1CS 约束的数量。

### 1.2 证明系统选型

推荐 **Groth16**,原因:
- 证明大小固定 ~200 字节(链上友好)
- 验证 ~3 次双线性对,毫秒级
- 生态成熟(libsnark、bellman、snarkjs、arkworks-groth16)
- 缺点是每个电路需单独可信设置(trusted setup),但对固定的 SM3 电路这是一次性成本

备选:PLONK / Halo2(无需 circuit-specific setup,但证明更大、验证更慢)。本项目用 Groth16 做主方案,Halo2 做未来扩展。

---

## 二、SM3 算法的逐步拆解(电路视角)

### 2.1 整体流程

```
输入消息 m (任意长度)
   ↓
【步骤1】填充 padding  →  得到 512 位整数倍的 m'
   ↓
【步骤2】分块 B_0, B_1, ..., B_{n-1}  (每块 512 位)
   ↓
【步骤3】初始化 V_0 = IV (固定256位常量)
   ↓
【步骤4】迭代压缩:V_{i+1} = CF(V_i, B_i)   ← 这是电路的核心
   ↓
【步骤5】输出 V_n 即为 256 位哈希值
```

**关键决策:哪些放电路内,哪些放电路外?**

| 步骤 | 位置 | 理由 |
|-----|-----|-----|
| 消息填充 | **电路外**(公开数据预处理) | 填充是确定性操作,验证者可自行计算,放电路内浪费约束 |
| 分块 | 电路外 | 同上 |
| IV 加载 | 电路内(作为常量) | 直接写死 8 个常量字,零约束 |
| **压缩函数 CF** | **电路内**(核心) | 这是需要 ZKP 证明的部分 |

### 2.2 压缩函数 CF(V, B) 的内部结构

```
输入:V = (A,B,C,D,E,F,G,H) 各32位;B = 512位消息块
   ↓
【子步骤1】消息扩展:B → W[0..67], W'[0..63]
   ↓
【子步骤2】64 轮迭代:for j = 0 to 63
   ↓
   每轮计算 SS1, SS2, TT1, TT2,更新 (A,B,C,D,E,F,G,H)
   ↓
【子步骤3】输出 V' = (A',B',...,H') ⊕ V
```

每个 SM3 块要在电路里展开这 **64 轮 + 消息扩展**,这是约束爆炸的主要来源。

---

## 三、R1CS 基础:SM3 的每种操作如何变成约束

### 3.1 R1CS 约束的形式

每个约束写作 `(A·z) × (B·z) = (C·z)`,其中 z 是所有变量(含公开、私有、辅助)组成的向量。

简单说:**一个 R1CS 约束就是"两个线性组合相乘等于第三个线性组合"**。

### 3.2 把 32 位字变成"位数组"—— 必要的第一步

SM3 的所有位运算都要求 32 位字先被**展开为 32 个布尔变量** `b_0, b_1, ..., b_31`,其中每个 `b_i ∈ {0,1}`。

这叫 **Num2Bits** 操作,成本是:

```
约束1:  x = b_0·2⁰ + b_1·2¹ + ... + b_31·2³¹    (1 个线性约束)
约束2~33:  b_i × b_i = b_i   (32 个布尔性约束,强制 b_i ∈ {0,1})
```

**总成本:~33 个约束 / 32位字**。这是所有位运算的起点开销。

### 3.3 各种位运算的约束成本

| 操作 | R1CS 表达 | 约束数(32位) | 备注 |
|------|---------|------------|------|
| **XOR (单位)** | `c = a + b - 2ab`,即 `2a·b = a+b-c` | 1 个 | 位域内便宜 |
| **AND (单位)** | `c = a·b` | 1 个 | |
| **NOT (单位)** | `c = 1 - a` | 0 个(线性) | 免费! |
| **OR (单位)** | `c = a + b - ab` | 1 个 | |
| **32位XOR** | 逐位XOR | 32 | 若已是位形式 |
| **32位AND** | 逐位AND | 32 | 若已是位形式 |
| **循环左移 ROTL_n** | 下标重排 | **0** | **免费!!** |
| **位取反** | 逐位 NOT | 0 | 免费 |
| **32位模加 (a+b mod 2³²)** | 需要 33 位分解 | ~34 | 较贵 |
| **三输入XOR** | `d = a⊕b⊕c`,合并两次 XOR | 32(位形式) | |

### 3.4 最关键的优化洞察

**保持"位形式"越久越好**:一旦把 32 位字展开成 32 个位,后续的 XOR、AND、循环移位都在位域里做,循环移位甚至完全免费(只需把下标重新编号即可,不产生约束)。

**加法是位域的敌人**:32 位模加必须先合成整数,加完再分解回位,每次 ~34 约束。所以要**合并多次加法**—— 比如把 `a + b + c + d mod 2³²` 合并成一次加法 + 一次 34 位分解,而不是 3 次 33 位分解。

---

## 四、SM3 电路的四层设计(对应 PPT 架构)

### 4.1 Layer 1 — 辅助操作层(基础 Gadget 库)

这一层就是把上面的 R1CS 表达封装成可复用组件。每个组件在 circom 里是一个 `template`:

```circom
// 1. 32位位分解 (32 constraints)
template Num2Bits32() {
    signal input in;
    signal output out[32];
    var lc = 0;
    for (var i = 0; i < 32; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;     // 布尔约束
        lc += out[i] * (1 << i);
    }
    lc === in;                            // 值约束
}

// 2. 循环左移 (0 constraints!)
template RotL32(n) {
    signal input in[32];
    signal output out[32];
    for (var i = 0; i < 32; i++) {
        out[i] <== in[(i + 32 - n) % 32];  // 纯线性赋值,无约束
    }
}

// 3. 逐位 XOR (32 constraints / 32位)
template BitwiseXor32() {
    signal input a[32];
    signal input b[32];
    signal output out[32];
    for (var i = 0; i < 32; i++) {
        out[i] <== a[i] + b[i] - 2*a[i]*b[i];
    }
}

// 4. 三输入 XOR (32 constraints,手工优化版本)
template BitwiseXor3() {
    signal input a[32]; signal input b[32]; signal input c[32];
    signal output out[32];
    signal ab[32];
    for (var i = 0; i < 32; i++) {
        ab[i] <== a[i] + b[i] - 2*a[i]*b[i];         // a XOR b
        out[i] <== ab[i] + c[i] - 2*ab[i]*c[i];      // (a XOR b) XOR c
    }
    // 总约束:32 × 2 = 64,但比两次独立XOR(96)少了一次中间分解
}

// 5. 32位模加 (~34 constraints)
template AddMod32(n) {   // n 个输入相加
    signal input in[n];
    signal output out[32];
    signal sum;
    sum <== in[0] + in[1] + ... + in[n-1];
    
    // 分解为 (32 + log2(n)) 位
    component n2b = Num2Bits(32 + log2Ceil(n));
    n2b.in <== sum;
    for (var i = 0; i < 32; i++) out[i] <== n2b.out[i];
    // 高位丢弃 = 自动 mod 2³²
}
```

**本层约束预算**:作为被频繁调用的基础库,总约束主要体现在调用次数上。

---

### 4.2 Layer 2 — 核心操作层(SM3 特有函数)

#### 置换函数 P0 和 P1

```
P0(X) = X ⊕ (X <<< 9) ⊕ (X <<< 17)
P1(X) = X ⊕ (X <<< 15) ⊕ (X <<< 23)
```

circom 实现(假设输入已是位形式):

```circom
template P0() {
    signal input in[32];
    signal output out[32];
    
    component r9 = RotL32(9);    // 0 约束
    component r17 = RotL32(17);  // 0 约束
    component xor3 = BitwiseXor3();  // 64 约束
    
    r9.in <== in;
    r17.in <== in;
    xor3.a <== in;
    xor3.b <== r9.out;
    xor3.c <== r17.out;
    out <== xor3.out;
}
```

**P0/P1 成本:64 约束**(仅三元 XOR,移位免费)。

#### 布尔函数 FF_j 和 GG_j

SM3 最恶心的地方:FF 和 GG 在前 16 轮和后 48 轮定义不同!

```
FF_j(X,Y,Z) = { X ⊕ Y ⊕ Z           if 0 ≤ j ≤ 15
              { (X∧Y) ∨ (X∧Z) ∨ (Y∧Z)  if 16 ≤ j ≤ 63    ← majority 函数

GG_j(X,Y,Z) = { X ⊕ Y ⊕ Z           if 0 ≤ j ≤ 15
              { (X∧Y) ∨ (¬X∧Z)       if 16 ≤ j ≤ 63    ← if-then-else 函数
```

**关键优化**:`majority(X,Y,Z)` 在位级可以用以下恒等式简化:

```
maj(x,y,z) = xy + yz + xz - 2xyz   (位级,x,y,z ∈ {0,1})
           = x·(y+z) - (2x-1)·yz
```

**IF-THEN-ELSE(GG 后半段)**:
```
ite(x,y,z) = (x∧y) ∨ (¬x∧z) = xy + (1-x)z - xy(1-x)z
            = xy + z - xz       (因为在位级 xy(1-x) = 0)
            = z + x·(y-z)       ← 只需 1 次乘法!
```

这个优化很漂亮:GG 后半段每位只要 **1 次乘法**,32 位就是 **32 约束**,而朴素实现要 96 约束。

```circom
template FF_high() {   // j >= 16
    signal input a[32]; signal input b[32]; signal input c[32];
    signal output out[32];
    signal ab[32]; signal bc[32]; signal ac[32];
    for (var i = 0; i < 32; i++) {
        ab[i] <== a[i] * b[i];
        bc[i] <== b[i] * c[i];
        ac[i] <== a[i] * c[i];
        // maj = ab + bc + ac - 2*a*b*c,但注意这里会越界,要分解
        // 实际上在位级:maj_i = ab[i] + bc[i] + ac[i] - 2*ab[i]*c[i]
        out[i] <== ab[i] + bc[i] + ac[i] - 2*ab[i]*c[i];
    }
    // 总约束:32 × 4 = 128
}

template GG_high() {   // j >= 16,优化版
    signal input e[32]; signal input f[32]; signal input g[32];
    signal output out[32];
    signal diff[32];
    for (var i = 0; i < 32; i++) {
        // ite(e,f,g) = g + e*(f-g)
        out[i] <== g[i] + e[i] * (f[i] - g[i]);
    }
    // 总约束:32(仅一次乘法每位)
}
```

#### 常量 T_j 的处理

T_j 只有两个值:
```
T_j = 0x79CC4519   (前16轮)
T_j = 0x7A879D8A   (后48轮)
```

而在每轮使用的是 `(T_j <<< j)`,这可以**全部预计算**为 64 个 32 位常量,硬编码进电路。**零额外约束**。

---

### 4.3 Layer 3 — 迭代压缩层

#### 消息扩展

```
输入:16 个 32 位字 W[0..15](来自消息块)
输出:W[0..67] 和 W'[0..63]

for j = 16 to 67:
    W[j] = P1( W[j-16] ⊕ W[j-9] ⊕ (W[j-3] <<< 15) ) ⊕ (W[j-13] <<< 7) ⊕ W[j-6]

for j = 0 to 63:
    W'[j] = W[j] ⊕ W[j+4]
```

**W[j] 每个字的成本**:
- 1 次三元 XOR(输入到 P1):64 约束
- 1 次 P0 或 P1 置换调用:64 约束
- 1 次三元 XOR(最终):64 约束
- 循环移位:0 约束
- 小计:~192 约束 / 字

52 个 W[j] 字(j=16..67):52 × 192 ≈ **9,984 约束**

**W'[j] 成本**(64 个):每个 32 约束,共 **2,048 约束**

**消息扩展总计:~12,000 约束**

#### 单轮压缩电路

每轮计算:
```
SS1 = ((A <<< 12) + E + (T_j <<< j)) <<< 7
SS2 = SS1 ⊕ (A <<< 12)
TT1 = FF_j(A,B,C) + D + SS2 + W'[j]
TT2 = GG_j(E,F,G) + H + SS1 + W[j]
D = C;   C = B <<< 9;   B = A;   A = TT1
H = G;   