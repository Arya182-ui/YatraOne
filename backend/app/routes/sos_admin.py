from fastapi import APIRouter, HTTPException, status
from app.firebase import firestore_db
from app.utils.notifications import push_notification

router = APIRouter()

@router.get("/sos-reports")
def get_sos_reports():
    docs = firestore_db.collection('sos_reports').order_by('timestamp', direction='DESCENDING').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.patch("/sos-reports/{report_id}")
def update_sos_report(report_id: str, status: str):
    doc_ref = firestore_db.collection('sos_reports').document(report_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="SOS report not found")
    doc_ref.update({"status": status})
    data = doc.to_dict()
    # Notify user
    push_notification(
        title="SOS Update",
        message=f"Your SOS report is marked as {status} by admin.",
        user_type="user",
        user_id=data.get('user_id', ''),
        extra={"type": "sos"}
    )
    return {"success": True, "id": report_id, "status": status}

@router.delete("/sos-reports/{report_id}")
def delete_sos_report(report_id: str):
    doc_ref = firestore_db.collection('sos_reports').document(report_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="SOS report not found")
    data = doc.to_dict()
    doc_ref.delete()
    # Notify user
    push_notification(
        title="SOS Deleted",
        message="Your SOS report was deleted by admin.",
        user_type="user",
        user_id=data.get('user_id', ''),
        extra={"type": "sos"}
    )
    return {"success": True, "id": report_id, "deleted": True}

@router.get("/incident-reports")
def get_incident_reports():
    docs = firestore_db.collection('incident_reports').order_by('timestamp', direction='DESCENDING').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.patch("/incident-reports/{report_id}")
def update_incident_report(report_id: str, status: str):
    doc_ref = firestore_db.collection('incident_reports').document(report_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident report not found")
    doc_ref.update({"status": status})
    data = doc.to_dict()
    # Notify user
    push_notification(
        title="Incident Update",
        message=f"Your incident report is marked as {status} by admin.",
        user_type="user",
        user_id=data.get('user_id', ''),
        extra={"type": "incident"}
    )
    return {"success": True, "id": report_id, "status": status}

@router.delete("/incident-reports/{report_id}")
def delete_incident_report(report_id: str):
    doc_ref = firestore_db.collection('incident_reports').document(report_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident report not found")
    data = doc.to_dict()
    doc_ref.delete()
    # Notify user
    push_notification(
        title="Incident Deleted",
        message="Your incident report was deleted by admin.",
        user_type="user",
        user_id=data.get('user_id', ''),
        extra={"type": "incident"}
    )
    return {"success": True, "id": report_id, "deleted": True}
