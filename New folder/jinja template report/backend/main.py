# main.py
from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pathlib import Path
from datetime import datetime, timedelta
from fastapi.staticfiles import StaticFiles
from Alarm import calculate_date_range, fetch_alarm_details, fetch_alarmoverview_details, fetch_statealarm_details, fetch_shiftwisealarm_details
from fastapi.templating import Jinja2Templates
import uvicorn

app = FastAPI()

# CORS (for frontend to access backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.mount("/static", StaticFiles(directory="static"), name="static")

# Set Jinja2 templates directory
templates = Jinja2Templates(directory="templates")


@app.get("/api/template-names")
def get_template_names():
    print("[DEBUG] /api/template-names endpoint hit")
    template_dir = Path(__file__).parent / "templates"
    print("[DEBUG] Template dir:", template_dir)
    template_files = [f.stem for f in template_dir.glob("*.html")]
    print("[DEBUG] Found templates:", template_files)
    return {"templates": template_files}


@app.post("/generate-report", response_class=HTMLResponse)
async def generate_report(
    request: Request,
    template: str = Form(...),              
    duration: str = Form(...),
    first_shift_time: str = Form(...),
    shifts_per_day: int = Form(...)
):
    db_name = "Alerton4_General"
    command = "top 10"
    sids = [sid.strip() for sid in "2,3,5,6,19,13,16,8,10".split(",")]
    date_range = calculate_date_range(duration)
    sdt = date_range["sdt"]
    edt = date_range["edt"]
    print(f"[DEBUG] Date Range: Start = {sdt}, End = {edt}")

    
    columns, rows = fetch_alarm_details(db_name, sids, sdt, edt, command)
    top_alarms = [dict(zip(columns, row)) for row in rows] if rows else []

    columns1, rows1 = fetch_alarmoverview_details(db_name, sids, sdt, edt)
    overview_alarms = [dict(zip(columns1, row1)) for row1 in rows1] if rows1 else []
    
    columnsstate, rowsstate = fetch_statealarm_details(db_name, sids, sdt, edt)
    state_alarms = [dict(zip(columnsstate, rowstate)) for rowstate in rowsstate] if rowsstate else []

    columnsshift, rowsshift = fetch_shiftwisealarm_details(db_name, sids, sdt, edt, shifts_per_day, first_shift_time)    
    hourly_shifts = [dict(zip(columnsshift, rowshift)) for rowshift in rowsshift] if rowsshift else []



    report = {
        "template": template,
        "duration": duration,
        "sdt": sdt,
        "edt": edt,
        "first_shift_time": first_shift_time,
        "shifts_per_day": shifts_per_day,
        "top_alarms"     :   top_alarms,
        "overview_alarms" : overview_alarms,
        "state_alarms" : state_alarms,
        "hourly_shifts" : hourly_shifts,
        "criticality_labels": ["fault", "high limit", "low limit", "offnormal", "unknown"],
        "criticality_values": [220, 198, 204, 1418, 67],
        "daily_dates": ["2025-02-22", "2025-04-10", "2025-06-15","2025-06-11","2025-06-12",],
        "daily_counts": [86, 73, 50 , 45, 60],
    "ai_insight": "Recent spike in alarms suggests sensor anomalies."
    }

    return templates.TemplateResponse(f"{template}.html", {"request": request, "report": report})


if __name__ == "__main__":
    print("Server running at http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
