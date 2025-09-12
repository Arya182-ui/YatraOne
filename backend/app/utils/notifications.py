from app.firebase import realtime_db
from datetime import datetime
from typing import Literal, Optional
import uuid

def push_notification(
    title: str,
    message: str,
    user_type: Literal['admin', 'user', 'driver', 'officer', 'all'],
    user_id: Optional[str] = None,
    extra: Optional[dict] = None
):
    notif = {
        'id': str(uuid.uuid4()),
        'title': title,
        'message': message,
        'createdAt': datetime.utcnow().isoformat() + 'Z',
        'isRead': False,
    }
    if extra:
        notif.update(extra)
    # Add expiresAt if provided in extra
    if extra and 'expiresAt' in extra:
        notif['expiresAt'] = extra['expiresAt']
    if user_type == 'all':
        # For broadcast, you may want to loop over all user_ids for each type
        # This should be handled in the route, not here, or you can implement as needed
        pass
    elif user_id:
        # Always write to notifications/{user_type}/{user_id}/{notificationId}
        realtime_db.child(f'notifications/{user_type}/{user_id}/{notif["id"]}').set(notif)
    elif user_type == 'admin':
        # Send to all admin users
        from app.firebase import firestore_db
        admins = firestore_db.collection('users').where('role', '==', 'admin').stream()
        for admin in admins:
            admin_id = admin.id
            realtime_db.child(f'notifications/admin/{admin_id}/{notif["id"]}').set(notif)
    else:
        # Do nothing if no user_id (invalid usage)
        pass
