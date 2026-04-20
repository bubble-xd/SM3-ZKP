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
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 26%),
    linear-gradient(180deg, #f8fafc 0%, #f8fafc 100%);
  color: #0f172a;
  font-family: "Inter", "Segoe UI", sans-serif;
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
  overflow: hidden;
  margin: 24px auto 18px;
  padding: 26px 28px;
  border: 1px solid #dbe4ee;
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 26%),
    linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
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

.ylws-hero-grid {
  position: relative;
  display: grid;
  gap: 14px;
  justify-items: center;
  text-align: center;
}

.ylws-hero-grid > div {
  width: 100%;
  max-width: 760px;
}

.ylws-hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  justify-content: center;
}

.ylws-hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}

.ylws-eyebrow {
  margin: 0 0 10px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.ylws-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.3rem, 4vw, 4rem);
  line-height: 1.02;
  letter-spacing: -0.05em;
}

.ylws-subtitle {
  margin: 10px auto 0;
  color: #334155;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.7;
  max-width: 42rem;
}

.ylws-description {
  margin: 0 auto;
  color: #475569;
  font-size: 14px;
  line-height: 1.8;
  max-width: 42rem;
}

@media (max-width: 640px) {
  .swagger-ui {
    padding-inline: 14px;
  }

  #ylws-docs-hero {
    padding: 22px;
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
