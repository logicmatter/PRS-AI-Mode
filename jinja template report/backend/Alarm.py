import pyodbc
from datetime import datetime
from Model import load_config,decrypt
from datetime import datetime, timedelta
import calendar

import re

def fetch_alarm_details(database_name, sids, sdt, edt, select_command):
    # Extract number from command string like "Get top10 daily alarms"
    match = re.search(r'top\s*(\d+)', select_command.lower())
    top_n = int(match.group(1)) if match else 10

    config = load_config()
    server = config.get("Destination", "SQLServerName", fallback="localhost")
    driver = config.get("Destination", "SQLODBCDriverName", fallback="{ODBC Driver 17 for SQL Server}")
    use_windows_auth = config.getboolean("Destination", "UseWindowsAuth", fallback=True)

    print(f"[INFO] Database: {database_name}")
    print(f"[INFO] Alarm SIDs: {sids}")
    print(f"[INFO] Start Date: {sdt}")
    print(f"[INFO] End Date: {edt}")
    print(f"[INFO] Select TOP: {top_n}")
    print(f"[INFO] Using Windows Authentication: {use_windows_auth}")

    # Ensure sids is a list
    if isinstance(sids, str):
        sids = [sids]

    # Build dynamic connection string
    if use_windows_auth:
        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"Trusted_Connection=yes;"
            f"TrustServerCertificate=yes;"
        )
    else:
        username = config.get("Destination", "DBUserName", fallback="")
        encrypted_password = config.get("Destination", "DBPassword", fallback="")

        try:
            decrypted_password = decrypt("sa", encrypted_password)
        except Exception as e:
            print(f"[ERROR] Password decryption failed: {e}")
            return [], [("Error", "Decryption failed")]

        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"UID={username};"
            f"PWD={decrypted_password};"
            f"TrustServerCertificate=yes;"
        )

    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("[INFO] Database connection successful.")

        # Build placeholders dynamically
        placeholders = ', '.join(['?'] * len(sids))

        query = f"""
            SELECT TOP {top_n}
                ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS SequenceNumber,
                DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS [Rank],
                COUNT(*) AS [Count],
                DevInst,
                AlarmSID,
                ObjInst,
                Description
            FROM [dbo].[dsmodel_getAlarmDetails]
            WHERE Begintime >= ? AND Begintime <= ?
              AND CAST(AlarmSID AS VARCHAR) IN ({placeholders})
            GROUP BY AlarmSID, DevInst, ObjInst, Description
            HAVING COUNT(*) > 0
            ORDER BY [Count] DESC;
        """

        params = [sdt, edt] + sids
        print(f"[INFO] Final Query:\n{query}")
        print(f"[INFO] Parameters: {params}")

        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

        print(f"[INFO] Columns: {columns}")
        print(f"[INFO] Row count: {len(rows)}")
        if rows:
            print(f"[INFO] First row: {rows[0]}")
        else:
            print("[WARNING] Query returned no rows.")

        return columns, rows

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")
        return [], [("Error", str(e))]

    finally:
        if 'cursor' in locals():
            cursor.close()
            print("[INFO] Cursor closed.")
        if 'conn' in locals():
            conn.close()
            print("[INFO] Connection closed.")

def fetch_statealarm_details(database_name, sids, sdt, edt):

    config = load_config()
    server = config.get("Destination", "SQLServerName", fallback="localhost")
    driver = config.get("Destination", "SQLODBCDriverName", fallback="{ODBC Driver 17 for SQL Server}")
    use_windows_auth = config.getboolean("Destination", "UseWindowsAuth", fallback=True)

    print(f"[INFO] Database: {database_name}")
    print(f"[INFO] Alarm SIDs: {sids}")
    print(f"[INFO] Start Date: {sdt}")
    print(f"[INFO] End Date: {edt}")
    print(f"[INFO] Using Windows Authentication: {use_windows_auth}")

    # Ensure sids is a list
    if isinstance(sids, str):
        sids = [sids]

    if not sids:
        print("[WARNING] No alarm SIDs provided.")
        return [], [("Warning", "No alarm SIDs specified.")]

    # Build connection string
    if use_windows_auth:
        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"Trusted_Connection=yes;"
            f"TrustServerCertificate=yes;"
        )
    else:
        username = config.get("Destination", "DBUserName", fallback="")
        encrypted_password = config.get("Destination", "DBPassword", fallback="")

        try:
            decrypted_password = decrypt("sa", encrypted_password)
        except Exception as e:
            print(f"[ERROR] Password decryption failed: {e}")
            return [], [("Error", "Decryption failed")]

        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"UID={username};"
            f"PWD={decrypted_password};"
            f"TrustServerCertificate=yes;"
        )

    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("[INFO] Database connection successful.")

        # Create placeholders for alarm SIDs
        placeholders = ', '.join(['?'] * len(sids))

        query = f"""
            SELECT
                ISNULL(AlarmState, 'no state') AS AlarmState,
                COUNT(*) AS [Alarm Count],
                COUNT(DISTINCT ALARMSID) AS [Unique Alarm Count],
                SUM(CASE WHEN ACKTIME IS NULL THEN 1 ELSE 0 END) AS [Never Acknowledged],
                SUM(CASE WHEN ENDTIME IS NULL THEN 1 ELSE 0 END) AS [Open Alarms]
            FROM
                [dbo].[dsmodel_getAlarmDetails]
            WHERE
                Begintime >= ? AND Begintime <= ?
                AND CAST(AlarmSID AS VARCHAR) IN ({placeholders})
            GROUP BY
                AlarmState, BeginToState
        """

        params = [sdt, edt] + sids
        print(f"[INFO] Final Query:\n{query}")
        print(f"[INFO] Parameters: {params}")

        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

        print(f"[INFO] Columns: {columns}")
        print(f"[INFO] Row count: {len(rows)}")
        if rows:
            print(f"[INFO] First row: {rows[0]}")
        else:
            print("[WARNING] Query returned no rows.")

        return columns, rows

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")
        return [], [("Error", str(e))]

    finally:
        if 'cursor' in locals():
            cursor.close()
            print("[INFO] Cursor closed.")
        if 'conn' in locals():
            conn.close()
            print("[INFO] Connection closed.")


def fetch_shiftwisealarm_details(database_name, sids, sdt, edt, shiftnumber, shiftfsttime):
    config = load_config()
    server = config.get("Destination", "SQLServerName", fallback="localhost")
    driver = config.get("Destination", "SQLODBCDriverName", fallback="{ODBC Driver 17 for SQL Server}")
    use_windows_auth = config.getboolean("Destination", "UseWindowsAuth", fallback=True)

    print(f"[INFO] Database: {database_name}")
    print(f"[INFO] Alarm SIDs: {sids}")
    print(f"[INFO] Start Date: {sdt}")
    print(f"[INFO] End Date: {edt}")
    print(f"[INFO] shiftnumber: {shiftnumber}")
    print(f"[INFO] shiftfsttime: {shiftfsttime}")
    print(f"[INFO] Using Windows Authentication: {use_windows_auth}")

    if isinstance(sids, str):
        sids = [sids]

    if not sids:
        print("[WARNING] No alarm SIDs provided.")
        return [], [("Warning", "No alarm SIDs specified.")]

    if use_windows_auth:
        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"Trusted_Connection=yes;"
            f"TrustServerCertificate=yes;"
        )
    else:
        username = config.get("Destination", "DBUserName", fallback="")
        encrypted_password = config.get("Destination", "DBPassword", fallback="")

        try:
            decrypted_password = decrypt("sa", encrypted_password)
        except Exception as e:
            print(f"[ERROR] Password decryption failed: {e}")
            return [], [("Error", "Decryption failed")]

        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"UID={username};"
            f"PWD={decrypted_password};"
            f"TrustServerCertificate=yes;"
        )

    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("[INFO] Database connection successful.")

        placeholders = ', '.join(['?'] * len(sids))

        query = f"""
            SELECT
              Shft.ShiftName,
              ShiftNo,
              ShiftTimePeriod,
              COUNT(AH.BeginTime) AS [Occurrence],
              COUNT(AH.AckTime) AS [AckOccurrence]
            FROM (
                SELECT
                  BeginTime,
                  AckTime,
                  Time24
                FROM
                  [dbo].[dsmodel_getAlarmDetails]
                WHERE
                  BeginTime >= ? AND BeginTime <= ?
                  AND CAST(AlarmSID AS VARCHAR) IN ({placeholders})
            ) AS AH
            RIGHT JOIN [ads].[Fun_Rpt_Shifts]('{shiftnumber}', '{shiftfsttime}') AS Shft
              ON AH.Time24 = Shft.ShiftTime
            GROUP BY
              Shft.ShiftName,
              ShiftNo,
              ShiftTimePeriod
            ORDER BY
              ShiftName ASC
        """

        params = [sdt, edt] + sids
        print(f"[INFO] Final Query:\n{query}")
        print(f"[INFO] Parameters: {params}")

        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

        print(f"[INFO] Columns: {columns}")
        print(f"[INFO] Row count: {len(rows)}")
        if rows:
            print(f"[INFO] First row: {rows[0]}")
        else:
            print("[WARNING] Query returned no rows.")

        return columns, rows

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")
        return [], [("Error", str(e))]

    finally:
        if 'cursor' in locals():
            cursor.close()
            print("[INFO] Cursor closed.")
        if 'conn' in locals():
            conn.close()
            print("[INFO] Connection closed.")

def fetch_alarmoverview_details(database_name, sids, sdt, edt):

    config = load_config()
    server = config.get("Destination", "SQLServerName", fallback="localhost")
    driver = config.get("Destination", "SQLODBCDriverName", fallback="{ODBC Driver 17 for SQL Server}")
    use_windows_auth = config.getboolean("Destination", "UseWindowsAuth", fallback=True)

    print(f"[INFO] Database: {database_name}")
    print(f"[INFO] Alarm SIDs: {sids}")
    print(f"[INFO] Start Date: {sdt}")
    print(f"[INFO] End Date: {edt}")
    print(f"[INFO] Using Windows Authentication: {use_windows_auth}")

    # Ensure sids is a list
    if isinstance(sids, str):
        sids = [sids]

    if not sids:
        print("[WARNING] No alarm SIDs provided.")
        return [], [("Warning", "No alarm SIDs specified.")]

    # Build connection string
    if use_windows_auth:
        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"Trusted_Connection=yes;"
            f"TrustServerCertificate=yes;"
        )
    else:
        username = config.get("Destination", "DBUserName", fallback="")
        encrypted_password = config.get("Destination", "DBPassword", fallback="")

        try:
            decrypted_password = decrypt("sa", encrypted_password)
        except Exception as e:
            print(f"[ERROR] Password decryption failed: {e}")
            return [], [("Error", "Decryption failed")]

        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database_name}_ADS;"
            f"UID={username};"
            f"PWD={decrypted_password};"
            f"TrustServerCertificate=yes;"
        )

    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("[INFO] Database connection successful.")

        # Create placeholders for alarm SIDs
        placeholders = ', '.join(['?'] * len(sids))

        query = f"""
            SELECT
    COUNT(*) AS [Alarm Count],
    COUNT(DISTINCT ALARMSID) AS [Unique Alarm Count],
    SUM(CASE WHEN ACKTIME IS NULL THEN 1 ELSE 0 END) AS [Never Acknowledged],
    SUM(CASE WHEN ENDTIME IS NULL THEN 1 ELSE 0 END) AS [Open Alarms],
    SUM(CASE WHEN ENDTOSTATE = 0 THEN 1 ELSE 0 END) AS [Return To Normal]
FROM
    [dbo].[dsmodel_getAlarmDetails]
WHERE Begintime >= ? AND Begintime <= ?

    AND CAST(AlarmSID AS VARCHAR) IN ({placeholders})

        """

        params = [sdt, edt] + sids
        print(f"[INFO] Final Query:\n{query}")
        print(f"[INFO] Parameters: {params}")

        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

        print(f"[INFO] Columns: {columns}")
        print(f"[INFO] Row count: {len(rows)}")
        if rows:
            print(f"[INFO] First row: {rows[0]}")
        else:
            print("[WARNING] Query returned no rows.")

        return columns, rows

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")
        return [], [("Error", str(e))]

    finally:
        if 'cursor' in locals():
            cursor.close()
            print("[INFO] Cursor closed.")
        if 'conn' in locals():
            conn.close()
            print("[INFO] Connection closed.")


def format_datetime(dt):
    return dt.strftime("%Y/%m/%d %I:%M:%S %p")

def calculate_date_range(duration_value):
    now = datetime.now()
    start = now
    end = now
    year = now.year
    month = now.month

    duration_value = duration_value.strip()

    if duration_value == "Today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Yesterday":
        start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = (now - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Last 7 days":
        start = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Last 30 days":
        start = (now - timedelta(days=29)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Last 90 days":
        start = (now - timedelta(days=89)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Week To Date":
        weekday = now.weekday()  
        days_since_sunday = (now.weekday() + 1) % 7
        start = (now - timedelta(days=days_since_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now 
    elif duration_value == "Week":
        days_since_last_sunday = (now.weekday() + 1) % 7 + 7  # ensures it's *last* week's Sunday
        start = (now - timedelta(days=days_since_last_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = (start + timedelta(days=6)).replace(hour=23, minute=59, second=59, microsecond=999999)
   
    elif duration_value == "Current Week":
        days_since_sunday = (now.weekday() + 1) % 7
        start = (now - timedelta(days=days_since_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)

        end = (start + timedelta(days=6)).replace(hour=23, minute=59, second=59, microsecond=999999)


    elif duration_value == "Month To Date":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now  # Keep exact current time

    elif duration_value == "Current Month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day = calendar.monthrange(now.year, now.month)[1]
        end = now.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)


    elif duration_value == "Last Month":
        first_day_last_month = now.replace(day=1) - timedelta(days=1)
        start = first_day_last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day = calendar.monthrange(first_day_last_month.year, first_day_last_month.month)[1]
        end = first_day_last_month.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Quarter To Date":
        quarter = (month - 1) // 3
        start_month = quarter * 3 + 1
        start = datetime(year, start_month, 1).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Current Quarter":
        quarter = (month - 1) // 3  
        start_month = quarter * 3 + 1
        start = datetime(year, start_month, 1).replace(hour=0, minute=0, second=0, microsecond=0)

        end_month = start_month + 2
        last_day = calendar.monthrange(year, end_month)[1]
        end = datetime(year, end_month, last_day).replace(hour=23, minute=59, second=59, microsecond=999999)


    elif duration_value in ["1 Quarter", "2 Quarter", "3 Quarter", "4 Quarter"]:
        q = int(duration_value[0]) - 1
        start = datetime(year, q * 3 + 1, 1).replace(hour=0, minute=0, second=0, microsecond=0)
        end_month = q * 3 + 3
        last_day = calendar.monthrange(year, end_month)[1]
        end = datetime(year, end_month, last_day).replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Year To Date":
        start = datetime(year, 1, 1).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Year":
        start = datetime(year, 1, 1).replace(hour=0, minute=0, second=0, microsecond=0)
        end = datetime(year, 12, 31).replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "Last Year":
        start = datetime(year - 1, 1, 1).replace(hour=0, minute=0, second=0, microsecond=0)
        end = datetime(year - 1, 12, 31).replace(hour=23, minute=59, second=59, microsecond=999999)

    elif "Last Year Quarter" in duration_value:
        q = int(duration_value.strip()[-1]) - 1
        start = datetime(year - 1, q * 3 + 1, 1).replace(hour=0, minute=0, second=0, microsecond=0)
        end_month = q * 3 + 3
        last_day = calendar.monthrange(year - 1, end_month)[1]
        end = datetime(year - 1, end_month, last_day).replace(hour=23, minute=59, second=59, microsecond=999999)

    elif duration_value == "2 Years":
        start = datetime(year - 1, 1, 1).replace(hour=0, minute=0, second=0, microsecond=0)
        end = datetime(year, 12, 31).replace(hour=23, minute=59, second=59, microsecond=999999)

    else:
        print("⚠️ Unhandled duration:", duration_value)

    return {
        "sdt": format_datetime(start),
        "edt": format_datetime(end)
    }










