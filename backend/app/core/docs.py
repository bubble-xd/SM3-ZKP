from __future__ import annotations

import json

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse


APP_SUBTITLE = "基于国密SM3和零知识证明的实现研究"

OPENAPI_DESCRIPTION = """
提供 SM3 摘要计算、零知识证明生成、证明校验与平台观测接口。

建议调用顺序：

1. `/api/hash`
2. `/api/prove`
3. `/api/verify`
"""

OPENAPI_TAGS = [
    {
        "name": "基础状态",
        "description": "服务健康检查与基础可用性确认。",
    },
    {
        "name": "证明生成",
        "description": "完成 SM3 摘要计算、消息拆块和 proof bundle 生成。",
    },
    {
        "name": "证明校验",
        "description": "校验 expected hash、证明链连接关系与 Groth16 结果。",
    },
    {
        "name": "平台观测",
        "description": "查看电路元数据、工具链状态和 benchmark 结果。",
    },
]

SWAGGER_UI_PARAMETERS = {
    "defaultModelsExpandDepth": -1,
    "defaultModelExpandDepth": 3,
    "displayRequestDuration": True,
    "docExpansion": "list",
    "filter": True,
    "persistAuthorization": True,
    "syntaxHighlight.theme": "obsidian",
    "tryItOutEnabled": True,
}

CUSTOM_CSS = """
body {
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% 10%, rgba(14, 165, 233, 0.14), transparent 28%),
    radial-gradient(circle at 92% 10%, rgba(250, 204, 21, 0.12), transparent 24%),
    radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.05), transparent 36%),
    linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
  color: #0f172a;
  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei UI", sans-serif;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(180deg, rgba(15, 23, 42, 0.18), transparent 90%);
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 15% 18%, rgba(56, 189, 248, 0.12), transparent 22%),
    radial-gradient(circle at 84% 14%, rgba(250, 204, 21, 0.11), transparent 18%),
    radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.08), transparent 28%);
  filter: blur(14px);
}

.swagger-ui {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 20px 40px;
  color: #0f172a;
}

.swagger-ui .topbar,
.swagger-ui .info {
  display: none;
}

.swagger-ui .wrapper {
  max-width: 1280px;
}

.swagger-ui .scheme-container {
  margin: 0 0 18px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #dbe4ee;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.swagger-ui .scheme-container .schemes > label {
  color: #475569;
}

.swagger-ui .scheme-container select,
.swagger-ui .download-url-wrapper input[type=text] {
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  box-shadow: none;
}

.swagger-ui .btn {
  border-radius: 12px;
  font-weight: 600;
  box-shadow: none;
}

.swagger-ui .btn.authorize {
  border-color: #bfdbfe;
  color: #2563eb;
  background: #eff6ff;
}

.swagger-ui .markdown code,
.swagger-ui code {
  background: #eff6ff;
  border-radius: 8px;
  padding: 0.15rem 0.45rem;
  color: #1d4ed8;
}

.swagger-ui .opblock-tag {
  margin: 0 0 12px;
  padding: 16px 18px;
  border: 1px solid #dbe4ee;
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
}

.swagger-ui .opblock-tag small {
  color: #64748b;
}

.swagger-ui .opblock {
  margin: 0 0 16px;
  border-width: 1px;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.swagger-ui .opblock .opblock-summary {
  padding: 15px 18px;
}

.swagger-ui .opblock .opblock-summary-method {
  border-radius: 999px;
  min-width: 82px;
  font-weight: 700;
}

.swagger-ui .opblock .opblock-summary-path,
.swagger-ui .opblock .opblock-summary-description {
  color: #0f172a;
}

.swagger-ui .opblock .opblock-section-header,
.swagger-ui .opblock .tab-header,
.swagger-ui .responses-inner h4,
.swagger-ui .responses-inner h5 {
  background: #f8fafc;
  color: #0f172a;
}

.swagger-ui .opblock-body pre,
.swagger-ui .highlight-code > .microlight,
.swagger-ui textarea,
.swagger-ui input[type=text] {
  border-radius: 12px;
  border-color: #dbe4ee;
  color: #0f172a;
}

.swagger-ui table tbody tr td,
.swagger-ui table thead tr th {
  color: #334155;
}

.swagger-ui .responses-table .response-col_status {
  font-weight: 700;
}

.swagger-ui .parameters-col_description input {
  min-width: 280px;
}

#ylws-docs-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin: 24px auto 18px;
  padding: 40px 42px 34px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 30px;
  background:
    radial-gradient(circle at 12% 14%, rgba(56, 189, 248, 0.22), transparent 26%),
    radial-gradient(circle at 88% 16%, rgba(250, 204, 21, 0.18), transparent 24%),
    linear-gradient(140deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.82));
  box-shadow:
    0 36px 100px -56px rgba(15, 23, 42, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(18px);
}

#ylws-docs-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, rgba(15, 23, 42, 0.18), transparent 92%);
}

#ylws-docs-hero::after {
  content: "";
  position: absolute;
  right: -8%;
  top: -28%;
  width: 360px;
  height: 360px;
  pointer-events: none;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.18), transparent 62%),
    radial-gradient(circle at 30% 34%, rgba(250, 204, 21, 0.16), transparent 44%);
  filter: blur(10px);
}

#ylws-docs-hero > * {
  position: relative;
  z-index: 1;
}

.ylws-hero-grid {
  position: relative;
  display: grid;
  gap: 20px;
  justify-items: center;
  text-align: center;
}

.ylws-hero-grid > div {
  width: 100%;
  max-width: 840px;
}

.ylws-hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  justify-content: center;
}

.ylws-hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 14px 28px -24px rgba(37, 99, 235, 0.45);
  backdrop-filter: blur(10px);
}

.ylws-eyebrow {
  display: inline-flex;
  align-items: center;
  margin: 0 auto 16px;
  padding: 8px 14px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  box-shadow: 0 14px 28px -24px rgba(37, 99, 235, 0.45);
}

.ylws-title {
  margin: 0;
  color: #0f172a;
  font-family: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", serif;
  font-size: clamp(3rem, 7vw, 5.4rem);
  line-height: 0.96;
  letter-spacing: -0.075em;
  text-wrap: balance;
  text-shadow: 0 18px 42px rgba(37, 99, 235, 0.12);
}

.ylws-subtitle {
  margin: 16px auto 0;
  color: #334155;
  font-size: clamp(1.05rem, 1.8vw, 1.35rem);
  font-weight: 500;
  line-height: 1.7;
  max-width: 44rem;
}

.ylws-description {
  display: inline-block;
  max-width: 100%;
  margin: 10px auto 0;
  padding: 10px 18px;
  border: 1px solid rgba(219, 234, 254, 0.95);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #475569;
  font-size: 14px;
  line-height: 1.8;
  box-shadow: 0 18px 36px -28px rgba(15, 23, 42, 0.28);
}

@media (max-width: 640px) {
  .swagger-ui {
    padding-inline: 14px;
  }

  #ylws-docs-hero {
    padding: 28px 22px 24px;
    border-radius: 24px;
  }

  .ylws-hero-meta {
    gap: 10px;
  }

  .ylws-description {
    border-radius: 18px;
  }
}
"""

CUSTOM_SCRIPT = """
(() => {
  const appTitle = "__APP_TITLE__";
  const appSubtitle = "__APP_SUBTITLE__";
  const chips = ["SM3 摘要", "证明生成", "证明校验", "平台观测"];

  const ensureHero = () => {
    const swaggerRoot = document.getElementById("swagger-ui");
    if (!swaggerRoot || document.getElementById("ylws-docs-hero")) {
      return;
    }

    const hero = document.createElement("section");
    hero.id = "ylws-docs-hero";
    hero.innerHTML = `
      <div class="ylws-hero-grid">
        <div>
          <p class="ylws-eyebrow">接口文档中心</p>
          <h1 class="ylws-title">${appTitle}</h1>
          <p class="ylws-subtitle">${appSubtitle}</p>
          <div class="ylws-hero-meta">
            ${chips.map((chip) => `<span class="ylws-hero-chip">${chip}</span>`).join("")}
          </div>
          <p class="ylws-description">建议调用顺序：/api/hash → /api/prove → /api/verify</p>
        </div>
      </div>
    `;

    swaggerRoot.before(hero);
  };

  const boot = () => {
    ensureHero();
    const observer = new MutationObserver(() => ensureHero());
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
"""


def build_docs_html(app: FastAPI) -> HTMLResponse:
    swagger_page = get_swagger_ui_html(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{app.title} · 接口文档",
        swagger_ui_parameters=SWAGGER_UI_PARAMETERS,
    )
    html = swagger_page.body.decode("utf-8")
    script = (
        CUSTOM_SCRIPT.replace('"__APP_TITLE__"', json.dumps(app.title))
        .replace('"__APP_SUBTITLE__"', json.dumps(APP_SUBTITLE))
    )
    html = html.replace("</head>", f"<style>{CUSTOM_CSS}</style></head>")
    html = html.replace("</body>", f"<script>{script}</script></body>")
    return HTMLResponse(html)
