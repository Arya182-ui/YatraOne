import datetime
from app.firebase import firestore_db

def log_action(user_id: str, action: str, details: dict = None):
    firestore_db.collection("audit_logs").add({
        "user_id": user_id,
        "action": action,
        "details": details or {},
        "timestamp": datetime.datetime.utcnow().isoformat()
    })
