
from fastapi import APIRouter, Request, HTTPException, status, UploadFile, File, Form, Depends
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from app.firebase import firestore_db
from app.utils.notifications import push_notification
from app.email_utils import send_template_email

router = APIRouter()

class SOSRequest(BaseModel):
    user_id: str
    message: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: Optional[datetime] = None


@router.post("/sos", status_code=201)
async def send_sos(sos: SOSRequest):
    # Save to Firestore
    doc_ref = firestore_db.collection('sos_reports').document()
    data = sos.dict()
    if not data.get('timestamp'):
        data['timestamp'] = datetime.utcnow()
    doc_ref.set(data)
    # Notify admin (push notification)
    push_notification(
        title="🚨 SOS Alert",
        message=f"SOS from user {sos.user_id}: {sos.message or 'No message'}",
        user_type="admin",
        extra={"type": "sos", "user_id": sos.user_id}
    )
    # Email to admin
    try:
        send_template_email(
            to_email="arya119000@gmail.com",  # Replace with real admin email or list
            subject="SOS Alert Received!",
            template_name="sos_admin.html",
            context={
                "user_name": sos.user_id,
                "user_email": "",  # Add user email if available
                "time": str(data['timestamp']),
                "location": f"{sos.latitude}, {sos.longitude}",
                "details": sos.message or "No message"
            }
        )
    except Exception as e:
        print(f"Failed to send SOS email: {e}")
    return {"success": True, "id": doc_ref.id, "saved": data}


from fastapi import UploadFile, File, Form
import base64


@router.post("/incident", status_code=201)
async def report_incident(
    user_id: str = Form(...),
    type: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    photo: UploadFile = File(None)
):
    data = {
        "user_id": user_id,
        "type": type,
        "description": description,
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": datetime.utcnow(),
    }
    if photo is not None:
        # For demo: store base64 string in Firestore (not for production!)
        content = await photo.read()
        data["photo_base64"] = base64.b64encode(content).decode()
        data["photo_filename"] = photo.filename
    doc_ref = firestore_db.collection('incident_reports').document()
    doc_ref.set(data)
    # Increment user's points in Firestore
    try:
        user_ref = firestore_db.collection('users').document(user_id)
        doc = user_ref.get()
        if doc.exists:
            user_data = doc.to_dict()
            current_points = user_data.get('points', 0)
            user_ref.update({'points': current_points + 1})
    except Exception as e:
        print(f"[WARN] Could not increment points for user {user_id}: {e}")
    # Notify admin (push notification)
    push_notification(
        title="⚠️ Incident Reported",
        message=f"Incident ({type}) from user {user_id}: {description[:60]}...",
        user_type="admin",
        extra={"type": "incident", "user_id": user_id}
    )
    # Email to admin
    try:
        send_template_email(
            to_email="arya119000@gmail.com",  # Replace with real admin email or list
            subject="Incident Report Submitted",
            template_name="incident_report_admin.html",
            context={
                "user_name": user_id,
                "user_email": "",  # Add user email if available
                "time": str(data['timestamp']),
                "location": f"{latitude}, {longitude}",
                "description": description
            }
        )
    except Exception as e:
        print(f"Failed to send incident email: {e}")
    return {"success": True, "id": doc_ref.id, "saved": data}
