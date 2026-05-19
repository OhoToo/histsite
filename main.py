from pathlib import Path
import json

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "timeline.json"

app = FastAPI(
    title="Битва за Москву",
    description="Интерактивный сайт с таймлайном и картами этапов Битвы за Москву.",
    version="2.0.0",
)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/timeline")
def get_timeline():
    if not DATA_PATH.exists():
        raise HTTPException(status_code=404, detail="Файл timeline.json не найден")

    try:
        with DATA_PATH.open("r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"Ошибка в timeline.json: {exc}") from exc


@app.get("/api/health")
def health():
    return {"status": "ok"}
