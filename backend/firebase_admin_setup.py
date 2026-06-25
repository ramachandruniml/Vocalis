import firebase_admin
from firebase_admin import credentials, auth
import os
import json
import base64

def init_firebase():
    if not firebase_admin._apps:
        b64 = os.environ.get("FIREBASE_SERVICE_ACCOUNT_BASE64")
        if b64:
            service_account = json.loads(base64.b64decode(b64).decode("utf-8"))
            cred = credentials.Certificate(service_account)
        elif os.path.exists("firebase-service-account.json"):
            cred = credentials.Certificate("firebase-service-account.json")
        else:
            print("Warning: Firebase service account not found - auth will be disabled")
            return
        firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str) -> dict:
    init_firebase()
    decoded = auth.verify_id_token(id_token)
    return decoded