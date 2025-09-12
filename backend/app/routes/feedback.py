
from fastapi import APIRouter, HTTPException, Depends, Query
from google.cloud import firestore
from app.models.feedback import Feedback
from app.firebase import firestore_db
from datetime import datetime
from typing import List
import uuid
from pydantic import BaseModel
from app.utils.notifications import push_notification

class StatusUpdate(BaseModel):
    status: str

router = APIRouter()

@router.patch("/feedback/{feedback_id}/status", response_model=Feedback)
def update_feedback_status(feedback_id: str, status_update: StatusUpdate):
    """
    Update the status of a feedback entry.
    Args:
        feedback_id (str): Feedback ID.
        status_update (StatusUpdate): New status value.
    Returns:
        Feedback: Updated feedback object.
    """
    doc_ref = firestore_db.collection("feedback").document(feedback_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Feedback not found")
    doc_ref.update({
        "status": status_update.status,
        "updated_at": datetime.utcnow().isoformat()
    })
    fb = doc_ref.get().to_dict()
    fb["id"] = feedback_id
    return Feedback(**fb)

@router.delete("/feedback/{feedback_id}")
def delete_feedback(feedback_id: str):
    """
    Delete a feedback entry by ID.
    Args:
        feedback_id (str): Feedback ID.
    Returns:
        dict: Success status and message.
    """
    doc_ref = firestore_db.collection("feedback").document(feedback_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Feedback not found")
    doc_ref.delete()
    return {"success": True, "message": "Feedback deleted"}


@router.get("/feedback", response_model=List[Feedback])
def get_feedback(
    user_id: str = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100)
):
    """
    Retrieve feedback entries, optionally filtered by user ID, with pagination.
    """
    feedback_ref = firestore_db.collection("feedback")
    # Only fetch required fields for low-bandwidth optimization
    fields = ["user_id", "message", "status", "created_at"]
    query = feedback_ref.select(fields)
    if user_id:
        query = query.where("user_id", "==", user_id)
    query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
    feedbacks = []
    for doc in query.offset(skip).limit(limit).stream():
        fb = doc.to_dict()
        fb["id"] = doc.id
        feedbacks.append(Feedback(**fb))
    return feedbacks


@router.post("/feedback", response_model=Feedback)
def submit_feedback(feedback: Feedback):
    """
    Submit new feedback and notify admins.
    Args:
        feedback (Feedback): Feedback object to submit.
    Returns:
        Feedback: Created feedback object.
    """
    feedback_id = f"fb{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()
    data = feedback.dict()
    data["id"] = feedback_id
    data["created_at"] = now.isoformat()
    data["updated_at"] = now.isoformat()
    firestore_db.collection("feedback").document(feedback_id).set(data)
    # Send notification to admins
    push_notification(
        title="New Feedback Submitted",
        message=f"{feedback.type.title() if hasattr(feedback, 'type') else 'Feedback'} received.",
        user_type="admin",
        extra={"event": "feedback", "feedbackId": feedback_id}
    )
    # Email to admin
    try:
        from app.email_utils import send_template_email
        send_template_email(
            to_email="admin@yatraone.com",  # Replace with real admin email or list
            subject="New Feedback Submitted",
            template_name="important_user.html",
            context={
                "name": feedback.name if hasattr(feedback, 'name') else "User",
                "message": feedback.message if hasattr(feedback, 'message') else "Feedback received."
            }
        )
    except Exception as e:
        print(f"Failed to send feedback email: {e}")
    return Feedback(**data)


@router.get("/feedback/stats")
def feedback_stats():
    """
    Get feedback statistics (total, pending, resolved, percent resolved).
    Returns:
        dict: Feedback stats summary.
    """
    feedback_ref = firestore_db.collection("feedback")
    total = 0
    resolved = 0
    pending = 0
    for doc in feedback_ref.stream():
        fb = doc.to_dict()
        total += 1
        if fb.get("status", "open") == "resolved":
            resolved += 1
        else:
            pending += 1
    percent_resolved = (resolved / total * 100) if total > 0 else 0
    return {
        "total": total,
        "pending": pending,
        "resolved": resolved,
        "percent_resolved": round(percent_resolved, 2)
    }