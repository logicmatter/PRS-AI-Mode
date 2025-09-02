import pyodbc
import base64
import hashlib
import hmac
import configparser
import os
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Util.Padding import unpad
import sys


def decrypt(key, cipher_text):
    try:
        cipher_bytes = base64.b64decode(cipher_text)
        salt = bytes([0x49, 0x76, 0x61, 0x6e, 0x20,
                      0x4d, 0x65, 0x64, 0x76, 0x65,
                      0x64, 0x65, 0x76])
        key = key.replace("\\\\", "\\")
        derived = PBKDF2(key, salt, dkLen=48)
        aes_key = derived[:32]
        aes_iv = derived[32:]
        cipher = AES.new(aes_key, AES.MODE_CBC, aes_iv)
        decrypted = cipher.decrypt(cipher_bytes)
        return unpad(decrypted, AES.block_size).decode('utf-16le')
    except Exception as ex:
        raise Exception(f"❌ Decryption failed: {ex}")






def verify_dotnet_password(stored_hash, password):
    decoded = base64.b64decode(stored_hash)

    if len(decoded) < 13:
        raise ValueError("Decoded hash is too short")

    if decoded[0] != 0x01:
        raise ValueError("Unsupported hash version (expected 0x01)")

    # Use 'big' instead of 'little' to fix your specific case
    prf = int.from_bytes(decoded[1:5], 'big')
    iter_count = int.from_bytes(decoded[5:9], 'big')
    salt_len = int.from_bytes(decoded[9:13], 'big')

    salt_start = 13
    salt_end = salt_start + salt_len
    salt = decoded[salt_start:salt_end]
    subkey = decoded[salt_end:]

    if len(subkey) == 0:
        raise ValueError("Derived subkey is empty")

    derived_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iter_count, dklen=len(subkey))

    return hmac.compare_digest(derived_key, subkey)



def load_config():
    if getattr(sys, 'frozen', False):
        base_dir = os.path.dirname(sys.executable)
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    print(f"[DEBUG] Base directory: {base_dir}")

    config_path_inside = os.path.join(base_dir, "Config", "config.ini")
    config_path_outside = os.path.abspath(os.path.join(base_dir, "..", "Config", "config.ini"))

    print(f"[DEBUG] Checking inside path: {config_path_inside}")
    if os.path.exists(config_path_inside):
        print("[INFO] Found config.ini inside project folder.")
        final_path = config_path_inside
    elif os.path.exists(config_path_outside):
        print("[WARNING] config.ini not found inside. Falling back to parent directory.")
        final_path = config_path_outside
    else:
        raise FileNotFoundError(
            f"[ERROR] config.ini not found.\nChecked:\n - {config_path_inside}\n - {config_path_outside}"
        )

    config = configparser.ConfigParser()
    config.read(final_path, encoding="utf-8-sig")
    return config

def load_database_name():
    config = load_config()
    return config.get("Portal", "WebsiteName", fallback="DefaultSite")

def get_connection():
    config = load_config()
    db_name = load_database_name()
    
    server = config.get("Destination", "SQLServerName", fallback="localhost")
    driver = config.get("Destination", "SQLODBCDriverName")

    use_windows_auth = config.getboolean("Destination", "UseWindowsAuth", fallback=True)

    if use_windows_auth:
        conn_str = (
            f'DRIVER={driver};'
            f'SERVER={server};'
            f'DATABASE={db_name};'
            f'Trusted_Connection=yes;'
            f'TrustServerCertificate=yes;'
        )
    else:
        username = config.get("Destination", "DBUserName")
        encrypted_password = config.get("Destination", "DBPassword")
        decrypted_password = decrypt("sa", encrypted_password)  

        conn_str = (
            f'DRIVER={driver};'
            f'SERVER={server};'
            f'DATABASE={db_name};'
            f'UID={username};'
            f'PWD={decrypted_password};'
            f'TrustServerCertificate=yes;'
        )

    return pyodbc.connect(conn_str)


def get_user_by_email(email):
    conn = get_connection()
    cursor = conn.cursor()
    db_name = load_database_name()
    try:
        cursor.execute(f"""
            SELECT pu.Id, pu.PasswordHash, pu.IsActive
            FROM [{db_name}].[dbo].[PortalUser] pu
            WHERE pu.Email = ?
        """, email)
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def get_tenants_by_userid(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    db_name = load_database_name()
    try:
        cursor.execute(f"""
            SELECT t.ID, ISNULL(t.TenantFriendlyName, t.TenantName) AS DisplayName
            FROM [{db_name}].[dbo].[UserTenants] ut
            JOIN [{db_name}].[dbo].[Tenant] t ON ut.TenantId = t.ID
            WHERE ut.UserId = ?
        """, user_id)
        return cursor.fetchall()  # returns list of (ID, DisplayName)
    finally:
        cursor.close()
        conn.close()

def get_tenant_name_by_friendly_name(friendly_name):
    try:
        conn = get_connection()  # Assume this returns a valid pyodbc connection
        cursor = conn.cursor()
        db_name = load_database_name()  # Returns something like 'Onprem'

        query = f"""
            SELECT TenantName 
            FROM [{db_name}].[dbo].[Tenant] 
            WHERE TenantFriendlyName = ?
        """
        cursor.execute(query, (friendly_name,))
        
        row = cursor.fetchone()
        if row and row[0]:
            return row[0]
        else:
            # No match or NULL in TenantFriendlyName, return input
            return friendly_name

    except Exception as e:
        print(f"[ERROR] Failed to fetch TenantName: {e}")
        return friendly_name  # Fallback to input value
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

