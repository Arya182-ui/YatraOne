import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, db, storage

# Load .env from backend root (handles Windows paths)

BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
env_path = os.path.join(BACKEND_ROOT, '.env')
print(f"[firebase.py] Loading .env from: {env_path}")
load_dotenv(env_path)

FIREBASE_SERVICE_ACCOUNT = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
print(f"[firebase.py] FIREBASE_SERVICE_ACCOUNT: {FIREBASE_SERVICE_ACCOUNT}")
if not FIREBASE_SERVICE_ACCOUNT or not os.path.exists(FIREBASE_SERVICE_ACCOUNT):
    raise FileNotFoundError(f"FIREBASE_SERVICE_ACCOUNT not found: {FIREBASE_SERVICE_ACCOUNT}")

FIREBASE_DATABASE_URL = os.environ.get('FIREBASE_DATABASE_URL')
FIREBASE_STORAGE_BUCKET = os.environ.get('FIREBASE_STORAGE_BUCKET', 'your-bucket.appspot.com')

cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT)
firebase_admin.initialize_app(cred, {
    "storageBucket": FIREBASE_STORAGE_BUCKET,
    "databaseURL": FIREBASE_DATABASE_URL
})

firestore_db = firestore.client()
realtime_db = db.reference()
bucket = storage.bucket()
