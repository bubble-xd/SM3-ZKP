# SM3 + ZKP 融合平台

一个从零实现的全栈演示系统，目标是证明：

> 我知道某个私密输入 `x`，使得 `SM3(x) = H`，但不泄露 `x`

项目采用：

- ZKP: `Circom 2` + `snarkjs` + `Groth16`
- Hash: 自定义 `SM3` 压缩 step circuit + 按块 proof bundle 聚合
- Frontend: `Next.js 15` + `TypeScript` + `Tailwind CSS` + `shadcn/ui` + `Recharts` + `Framer Motion`
- Backend: `FastAPI` + `Python 3.11+`

当前版本限制：

- 默认支持最多 `4` 个 SM3 block
- 原像长度 `<= 247 bytes`
- padding 在电路外完成
- 每个 step proof 的私有输入：`block_bits[512]`
- 每个 step proof 的公开输入：`state_in_words[8]` + `state_out_words[8]`
- 聚合层公开输出：最终 `expected_hash_words[8]`

## 目录结构

```text
.
├── frontend/
├── backend/
├── circuits/
├── scripts/
├── benchmarks/
├── docs/
├── examples/
├── .env.example
└── README.md
```

## 1. 环境要求

推荐直接使用已经准备好的 Conda 环境：

- 环境名：`sm3-zkp`

该环境中当前已验证可用：

- Python `3.11.15`
- Node.js `22.22.2`
- npm `10.9.7`
- `circom 2.1.8`
- `snarkjs 0.7.6`

检查本机环境：

```bash
conda activate sm3-zkp
bash scripts/check_toolchain.sh
```

## 2. 安装

### 2.1 激活环境

```bash
conda activate sm3-zkp
```

### 2.2 后端依赖

```bash
pip install -r backend/requirements.txt
```

### 2.3 前端依赖

```bash
cd frontend
npm install
cd ..
```

### 2.4 环境变量

```bash
cp .env.example .env
```

关键变量：

- `AUTO_SETUP=false`: 是否在后端启动时自动尝试准备电路产物
- `CIRCUIT_NAME=sm3_compression_step`: 当前使用的电路名称

说明：

- 当前版本不再提供 mock proving / mock verify
- 生成或验证证明前，必须先完成第 4 节的电路编译与 Groth16 setup

## 3. 启动开发环境

推荐开两个终端，两个终端都先执行：

```bash
conda activate sm3-zkp
```

### 3.1 启动 FastAPI

终端 A：

```bash
bash scripts/dev_backend.sh
```

或：

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3.2 启动 Next.js

终端 B：

```bash
bash scripts/dev_frontend.sh
```

或：

```bash
cd frontend
npm run dev
```

### 3.3 访问地址

默认地址：

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- OpenAPI: `http://localhost:8000/docs`

### 3.4 最小启动顺序

如果你只是想把项目跑起来，按下面顺序即可：

```bash
conda activate sm3-zkp
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
cp .env.example .env
python3 scripts/setup_circuit.py
```

然后分别启动：

```bash
bash scripts/dev_backend.sh
```

```bash
bash scripts/dev_frontend.sh
```

## 4. 电路编译与 Groth16 Setup

```bash
python3 scripts/setup_circuit.py
```

默认会使用 `--power 17`，以满足当前 `sm3_compression_step` 电路的约束规模。

脚本会完成：

1. 生成 powers of tau
2. 编译 `circuits/sm3_compression_step.circom`
3. 生成 `.r1cs / .wasm / .sym`
4. 执行 `groth16 setup`
5. 导出 `verification_key.json`
6. 写出 `circuits/build/sm3_compression_step/meta.json`

生成后的关键文件：

- `circuits/build/sm3_compression_step/sm3_compression_step.r1cs`
- `circuits/build/sm3_compression_step/sm3_compression_step_js/sm3_compression_step.wasm`
- `circuits/build/sm3_compression_step/sm3_compression_step_final.zkey`
- `circuits/build/sm3_compression_step/verification_key.json`

## 5. 生成输入、证明与验证

执行下面命令前，请先完成第 4 节的 setup；否则后端会因为缺少电路产物而直接报错。

### 生成电路输入

```bash
python3 scripts/generate_input.py \
  --message abc \
  --output examples/input_abc.json \
  --summary-output examples/input_abc_summary.json
```

### 生成 proof

```bash
python3 scripts/prove.py --message abc
```

默认输出目录：

- `examples/latest-proof/input.json`
- `examples/latest-proof/proof.json`
- `examples/latest-proof/public_signals.json`
- `examples/latest-proof/report.json`

说明：

- `input.json` 保存 proof chain 的 step 输入集合
- `proof.json` 保存 proof bundle，其中包含每个 block 的 step proof 与 public signals
- `public_signals.json` 默认保存聚合层最终 digest words

### 验证 proof

```bash
python3 scripts/verify.py \
  --proof examples/latest-proof/proof.json \
  --public-signals examples/latest-proof/public_signals.json \
  --expected-hash 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0
```

## 6. API 列表

- `POST /api/hash`
- `POST /api/prove`
- `POST /api/verify`
- `GET /api/benchmark`
- `GET /api/circuit/meta`

统一返回格式：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

详细字段见 [docs/api.md](docs/api.md)。

## 7. 运行测试

当前仓库包含：

- 纯软件 SM3 标准向量测试
- 多块 padding 边界测试
- 电路输入生成测试

运行：

```bash
bash scripts/run_backend_tests.sh
```

或：

```bash
pytest backend/tests -q
```

前端静态检查与构建：

```bash
cd frontend
npm run lint
npm run build
```

## 8. 运行 Benchmark

```bash
python3 scripts/benchmark.py
```

输出：

- `benchmarks/results/<timestamp>/results.json`
- `benchmarks/results/latest.json`

默认消息长度会按当前电路上限自动选择，默认 4-block 配置下通常包含：

- `8B`
- `16B`
- `32B`
- `55B`
- `96B`
- `160B`
- `247B`

记录字段：

- `software_hash_ms`
- `witness_generation_ms`
- `proving_ms`
- `verification_ms`
- `proof_size_bytes`

前端 `/dashboard` 和 `/experiments` 直接读取 `latest.json`。

## 9. 示例文件

- `examples/input_abc.json`
- `examples/input_abc_summary.json`

说明：

- `input_abc.json` 是可直接喂给 witness 生成器的真实电路输入
- `input_abc_summary.json` 保存消息、padding 和 hash 摘要信息
- 真实 proof / public signals 会在运行 `python3 scripts/prove.py --message abc` 后写入 `examples/latest-proof/`

## 10. 页面说明

### `/`

- 项目介绍
- 技术栈
- Pipeline 说明

### `/prove`

- 输入消息
- 自动哈希
- proof / public signals 展示
- proving 状态与指标卡片

### `/verify`

- 手动粘贴 hash / proof / public signals
- 验证结果展示

### `/dashboard`

- 工具链状态
- artifact 状态
- proving key / verification key 大小
- benchmark 图表

### `/experiments`

- 正确性实验说明
- benchmark 表格
- 导出 JSON

## 11. 前端完整操作样例

下面给出一套从首页进入，到证明、验证、指标查看和实验导出的完整前端操作流程。

### 11.1 准备工作

先确保前后端都已经启动：

```bash
conda activate sm3-zkp
bash scripts/dev_backend.sh
```

另开一个终端：

```bash
conda activate sm3-zkp
bash scripts/dev_frontend.sh
```

如果你希望 `/dashboard` 和 `/experiments` 页面里有完整 benchmark 数据，建议先执行一次：

```bash
conda activate sm3-zkp
python3 scripts/setup_circuit.py
python3 scripts/benchmark.py
```

### 11.2 首页确认

浏览器打开：

- `http://localhost:3000`

你应该能看到：

- 首页平台介绍
- “进入证明工作台”按钮
- “打开验证中心”按钮
- “查看指标面板”按钮

这说明前端页面已经正常加载，路由入口可用。

### 11.3 在 `/prove` 页面生成证明

进入：

- `http://localhost:3000/prove`

操作步骤：

1. 在输入框中填入消息：`abc`
2. 等待页面自动完成哈希计算
3. 点击 `Generate Proof`

预期现象：

- 页面状态会经历 `hashing` -> `proving` -> `done`
- `SM3 Digest` 中可以看到摘要：

```text
66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0
```

- `Expected Hash Words` 会显示摘要拆分后的 word 数组
- `Proof JSON` 会显示 proof bundle
- `Public Signals` 会显示公开输出
- 顶部指标卡会显示：
  - 输入长度
  - proof 大小
  - witness 时间
  - proving 时间

建议这一步把下面三个结果保留下来，下一页验证会直接使用：

- `SM3 Digest`
- `Proof JSON`
- `Public Signals`

### 11.4 在 `/verify` 页面验证证明

进入：

- `http://localhost:3000/verify`

把上一步得到的内容填进去：

1. `Expected hash (hex)` 填入：

```text
66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0
```

2. `Proof Input` 粘贴 `/prove` 页面里的 `Proof JSON`
3. `Public Signals Input` 粘贴 `/prove` 页面里的 `Public Signals`
4. 点击 `Verify Proof`

预期现象：

- 页面状态会变成 `verifying`，随后变成 `done`
- `Verification Result` 中应出现类似结果：

```json
{
  "verified": true
}
```

### 11.5 在 `/dashboard` 页面查看平台状态

进入：

- `http://localhost:3000/dashboard`

建议重点查看：

- `Max Message`
- `Constraints`
- `Proving Key`
- `Reference Proof`
- `Toolchain & Artifacts`
- 三张 benchmark 图表

预期现象：

- 如果工具链和电路文件已准备好，`Node / Circom / snarkjs` 会显示为可用
- `R1CS / WASM / ZKey / VKey` 会显示 artifact 状态
- 如果已经执行过 `python3 scripts/benchmark.py`，页面下方图表会有真实数据

### 11.6 在 `/experiments` 页面查看实验结果

进入：

- `http://localhost:3000/experiments`

建议操作：

1. 查看 `Correctness Checklist`
2. 查看 `Benchmark Table`
3. 点击 `Export Benchmark JSON`

预期现象：

- 表格会列出不同消息长度对应的：
  - hash
  - witness 时间
  - prove 时间
  - verify 时间
  - proof 大小
- 图表会展示 `software_hash_ms`、`proving_ms`、`proof_size_bytes` 的变化趋势
- 点击导出按钮后，浏览器会下载 benchmark JSON 文件

### 11.7 一条完整演示链路总结

如果你要给别人演示前端，最简单的一条路径就是：

1. 打开首页，说明平台入口和模块划分
2. 进入 `/prove`，输入 `abc`，生成 proof bundle
3. 复制摘要、proof 和 public signals
4. 进入 `/verify`，粘贴并验证，展示 `verified: true`
5. 进入 `/dashboard`，展示工具链状态和性能指标
6. 进入 `/experiments`，展示 benchmark 表格和导出能力

这样可以把“消息输入 -> 证明生成 -> 结果验证 -> 指标展示 -> 实验导出”完整串起来。

## 12. 当前工程说明

### 已在当前环境验证

- `sm3-zkp` 环境中的 `node / npm / circom / snarkjs`
- Frontend `npm install`
- Frontend `npm run lint`
- Frontend `npm run build`

### 启动前仍建议确认

- 已执行 `pip install -r backend/requirements.txt`
- 已执行 `cp .env.example .env`
- 如需真实证明链路，已执行 `python3 scripts/setup_circuit.py`

## 13. 附加文档

- [docs/architecture.md](docs/architecture.md)
- [docs/api.md](docs/api.md)
- [docs/screenshots.md](docs/screenshots.md)
