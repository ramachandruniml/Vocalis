import firebase_admin
from firebase_admin import credentials, auth
import os

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str) -> dict:
    init_firebase()
    decoded = auth.verify_id_token(id_token)
    return decoded