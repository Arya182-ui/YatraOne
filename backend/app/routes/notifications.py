
from fastapi import APIRouter, Body, HTTPException
from app.firebase import realtime_db, firestore_db
from pydantic import BaseModel, Field
import uuid
from typing import Optional, List

router = APIRouter()

class NotificationModel(BaseModel):
    id: Optional[str] = None
    title: str
    message: str
    type: Optional[str] = None
    actionUrl: Optional[str] = None
    actionText: Optional[str] = None
    actions: Optional[list] = None
    isRead: bool = False
    createdAt: Optional[str] = None
    expiresAt: Optional[str] = None
    metadata: Optional[dict] = None
    priority: Optional[str] = None
    icon: Optional[str] = None
    senderType: Optional[str] = None

@router.post("/send")
def send_notification(
    user_type: str = Body(..., embed=True),
    user_id: Optional[str] = Body(None, embed=True),
    notification: NotificationModel = Body(...)
):
    """
    Send a notification to a user or broadcast to all users of a type.
    Args:
        user_type (str): User type (admin, user, driver, officer, all).
        user_id (str, optional): User ID to send to (if not broadcast).
        notification (NotificationModel): Notification details.
    Returns:
        dict: Success status and notification ID.
    """
    notif_id = notification.id or str(uuid.uuid4())
    notification.id = notif_id
    if not notification.createdAt:
        from datetime import datetime
        notification.createdAt = datetime.utcnow().isoformat() + 'Z'
    # Broadcast to all users of a type
    if user_type == 'all':
        for t in ['admin', 'user', 'driver', 'officer']:
            users = firestore_db.collection('users').where('role', '==', t).stream()
            for u in users:
                uid = u.id
                notif_ref = realtime_db.child(f'notifications/{t}/{uid}/{notif_id}')
                notif_ref.set(notification.dict())
        return {"success": True, "id": notif_id, "broadcast": True}
    elif user_id:
        notif_ref = realtime_db.child(f'notifications/{user_type}/{user_id}/{notif_id}')
        notif_ref.set(notification.dict())
        return {"success": True, "id": notif_id}
    else:
        raise HTTPException(status_code=400, detail="user_id required unless broadcasting to all")

@router.post("/mark-read")
def mark_notification_read(
    user_type: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    notification_id: str = Body(..., embed=True)
):
    """
    Mark a notification as read for a user.
    Args:
        user_type (str): User type.
        user_id (str): User ID.
        notification_id (str): Notification ID.
    Returns:
        dict: Success status.
    """
    notif_ref = realtime_db.child(f'notifications/{user_type}/{user_id}/{notification_id}')
    notif_ref.update({"isRead": True})
    return {"success": True}

@router.post("/mark-all-read")
def mark_all_notifications_read(
    user_type: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True)
):
    """
    Mark all notifications as read for a user.
    Args:
        user_type (str): User type.
        user_id (str): User ID.
    Returns:
        dict: Success status and count of updated notifications.
    """
    notifs_ref = realtime_db.child(f'notifications/{user_type}/{user_id}')
    notifs = notifs_ref.get()
    if not notifs:
        return {"success": True, "updated": 0}
    count = 0
    for notif_id in notifs:
        notifs_ref.child(notif_id).update({"isRead": True})
        count += 1
    return {"success": True, "updated": count}


@router.post("/delete")
def delete_notification(
    user_type: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    notification_id: str = Body(..., embed=True)
):
    """
    Delete a notification for a user.
    Args:
        user_type (str): User type.
        user_id (str): User ID.
        notification_id (str): Notification ID to delete.
    Returns:
        dict: Success status.
    """
    notif_ref = realtime_db.child(f'notifications/{user_type}/{user_id}/{notification_id}')
    notif_ref.delete()
    return {"success": True}
