import os
import time
from collections import defaultdict, deque

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.error_handling import SafeExceptionMiddleware
from app.routes import (
    admin,
    admin_payments,
    auth,
    feedback,
    health,
    jornada,
    mapa_vivo,
    oraculo,
    payments,
    produto1,
    produto2,
    produto3,
    quiz,
    status,
    webhooks,
)

load_dotenv()


def get_allowed_origins() -> list[str]:
    origins = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    return [origin.strip() for origin in origins.split(",") if origin.strip()]


RATE_LIMIT_EXEMPT_PREFIXES = ("/health", "/docs", "/openapi.json")
RATE_LIMIT_STATE: dict[str, deque[float]] = defaultdict(deque)


def get_rate_limit_for_path(path: str) -> tuple[int, int]:
    if path.endswith("/pdf"):
        return int(os.getenv("RATE_LIMIT_PDF_REQUESTS", "6")), 60

    if path.startswith("/api/admin") or path.startswith("/api/oraculo"):
        return int(os.getenv("RATE_LIMIT_SENSITIVE_REQUESTS", "40")), 60

    return int(os.getenv("RATE_LIMIT_REQUESTS", "120")), 60


def get_request_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.client.host if request.client else "unknown"


app = FastAPI(
    title="Metodo ORI API",
    description="Backend inicial do sistema Metodo ORI by Telurica.",
    version="0.1.0",
)


@app.middleware("http")
async def rate_limit_requests(request: Request, call_next):
    path = request.url.path

    if request.method == "OPTIONS" or path.startswith(RATE_LIMIT_EXEMPT_PREFIXES):
        return await call_next(request)

    limit, window_seconds = get_rate_limit_for_path(path)
    key = f"{get_request_ip(request)}:{path}"
    now = time.monotonic()
    window = RATE_LIMIT_STATE[key]

    while window and now - window[0] > window_seconds:
        window.popleft()

    if len(window) >= limit:
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.",
            },
        )

    window.append(now)
    return await call_next(request)


app.add_middleware(SafeExceptionMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(admin_payments.router)
app.include_router(feedback.router)
app.include_router(jornada.router)
app.include_router(mapa_vivo.router)
app.include_router(oraculo.router)
app.include_router(payments.router)
app.include_router(produto1.router)
app.include_router(produto2.router)
app.include_router(produto3.router)
app.include_router(quiz.router)
app.include_router(status.router)
app.include_router(webhooks.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Metodo ORI API",
        "version": app.version,
    }
