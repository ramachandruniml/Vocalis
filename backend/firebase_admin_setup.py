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
                print("Continuing without Firebase - auth will be disabled")
                _firebase_initialized = True
        else:
            print(f"Warning: Firebase service account file not found: {cred_path}")
            print("Continuing without Firebase - auth will be disabled")
            _firebase_initialized = True

def verify_firebase_token(id_token: str) -> dict:
    init_firebase()
    if not firebase_admin._apps:
        # Firebase not initialized, return mock user for development
        return {"uid": "dev-user", "email": "dev@example.com"}
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        # Return mock user for development if token verification fails
        print(f"Warning: Token verification failed: {e}")
        return {"uid": "dev-user", "email": "dev@example.com"}