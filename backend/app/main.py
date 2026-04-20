from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.responses import RedirectResponse

from app.api.routes import router
from app.core.config import get_settings
from app.core.docs import APP_SUBTITLE, OPENAPI_DESCRIPTION, OPENAPI_TAGS, build_docs_html


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=OPENAPI_DESCRIPTION,
    summary=APP_SUBTITLE,
    docs_url=None,
    redoc_url=None,
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.api_prefix)


@app.get("/", include_in_schema=False)
def index() -> RedirectResponse:
    return RedirectResponse(url="/docs", status_code=307)


@app.get("/docs", include_in_schema=False)
def docs() -> HTMLResponse:
    return build_docs_html(app)


@app.get("/favicon.ico", include_in_schema=False, status_code=204)
def favicon() -> Response:
    return Response(status_code=204)


@app.get(
    "/health",
    tags=["基础状态"],
    summary="检查服务健康状态",
    description="返回服务状态、应用名称与版本号，适合用于联调前的基础连通性检查。",
)
def healthcheck() -> dict[str, object]:
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.version,
    }
