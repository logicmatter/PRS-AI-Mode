from fastapi import FastAPI, HTTPException, Query
from typing import Optional
from manager import MetricsManager  # assuming same-folder import or adjust as needed
from config import get_config

app = FastAPI()
config = get_config()

metrics_manager = MetricsManager(config)

@app.get("/metrics")
async def get_metrics(
    tid: str,
    sid: int,
    sdt: str,
    edt: str,
    apptype: Optional[str] = Query("trend", description="Asset or application type"),
    res: Optional[str] = Query("hourly", description="Resolution of metrics")
):
    """
    Fetch or compute metrics for given tenant/sensor/date range/apptype.
    """
    try:
        metrics_df = metrics_manager.get_metrics(tid, sid, sdt, edt, apptype, res)
        return metrics_df.to_dict(orient="records")  # Return JSON array of metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
