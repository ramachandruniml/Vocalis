import firebase_admin
from firebase_admin import credentials, auth
import os

_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if not firebase_admin._apps and not _firebase_initialized:
        cred_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "firebase-service-account.json")
        if os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                _firebase_initialized = True
            except Exception as e:
                print(f"Warning: Firebase initialization failed: {e}")
                _firebase_initialized = True
        else:
            print(f"Warning: Firebase service account file not found: {cred_path}")
            _firebase_initialized = True

def verify_firebase_token(id_token: str) -> dict:
    init_firebase()
    if not firebase_admin._apps:
        if os.environ.get("ALLOW_DEV_AUTH", "false").lower() == "true":
            return {"uid": "dev-user", "email": "dev@example.com", "name": "Development User"}
        raise ValueError("Firebase Admin is not initialized")
    try:
        return auth.verify_id_token(id_token)
    except Exception as e:
        print(f"Warning: Token verification failed: {e}")
        raise
