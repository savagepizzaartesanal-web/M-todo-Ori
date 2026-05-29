import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import admin, auth, health, jornada, oraculo, produto1, quiz, status

load_dotenv()


def get_allowed_origins() -> list[str]:
    origins = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    return [origin.strip() for origin in origins.split(",") if origin.strip()]


app = FastAPI(
    title="Metodo ORI API",
    description="Backend inicial do sistema Metodo ORI by Telurica.",
    version="0.1.0",
)

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
app.include_router(jornada.router)
app.include_router(oraculo.router)
app.include_router(produto1.router)
app.include_router(quiz.router)
app.include_router(status.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Metodo ORI API",
        "version": app.version,
    }
