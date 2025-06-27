import streamlit as st
from datetime import datetime
import requests

API_BASE_URL = "http://localhost:8080"

def fetch_metrics(tid: str, sid: int, sdt: str, edt: str, apptype: str):
    url = f"{API_BASE_URL}/metrics"
    params = {
        "tid": tid,
        "sid": sid,
        "sdt": sdt,
        "edt": edt,
        "apptype": apptype
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        st.error(f"Error fetching metrics: {e}")
        return None

def main():
    st.title("Metrics Dashboard")

    tid = st.text_input("Tenant ID", "tenant_1")
    sid = st.number_input("Sensor ID", min_value=1, value=1001)
    sdt = st.date_input("Start Date", datetime.today())
    edt = st.date_input("End Date", datetime.today())
    apptype = st.selectbox("Asset Type", ["alarm", "energy", "trend", "creqp", "crenv"])

    if st.button("Fetch Metrics"):
        sdt_iso = sdt.isoformat()
        edt_iso = edt.isoformat()
        metrics = fetch_metrics(tid, sid, sdt_iso, edt_iso, apptype)
        if metrics:
            st.json(metrics)
        else:
            st.warning("No metrics returned or error occurred.")

if __name__ == "__main__":
    main()
