from app.email_utils import send_otp_email
import random
import time

from fastapi import Depends
from app.services.user_service import verify_delete_account_otps, verify_user_password, set_user_password
from fastapi import APIRouter, HTTPException, status, Query, Body
from app.firebase import firestore_db
from typing import List, Optional
from pydantic import BaseModel, EmailStr

router = APIRouter()


# Pydantic model for profile update
class UserProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    language: Optional[str] = None

@router.patch("/users/{user_id}/profile")
def update_user_profile(user_id: str, profile: UserProfileUpdate = Body(...)):
    """
    Update a user's profile fields (firstName, lastName, email, language).
    Args:
        user_id (str): User's unique ID.
        profile (UserProfileUpdate): Fields to update.
    Returns:
        dict: Success status.
    """
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = profile.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    user_ref.update(update_data)
    return {"success": True}

@router.post("/users/{user_id}/delete-account/send-otp")
def send_delete_account_otp(user_id: str):
    """
    Send an OTP to the user's email for account deletion verification.
    Args:
        user_id (str): User's unique ID.
    Returns:
        dict: Success status.
    """
    user_ref = firestore_db.collection('users').document(user_id)
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    user = doc.to_dict()
    email = user.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="User email not found")
    otp = str(random.randint(100000, 999999))
    now = int(time.time())
    firestore_db.collection('otp_temp').document(email).set({
        'otp': otp,
        'purpose': 'delete_account',
        'created_at': now,
    })
    name = user.get('firstName') or email.split('@')[0]
    try:
        send_otp_email(email, name, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    return {"success": True}

# Reset user password
@router.post("/users/{user_id}/reset-password")
def reset_user_password(user_id: str, data: dict = Body(...)):
    """
    Reset a user's password after verifying the current password.
    Args:
        user_id (str): User's unique ID.
        data (dict): Contains currentPassword and newPassword.
    Returns:
        dict: Success status.
    """
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Missing password fields")
    # Verify current password (implement in user_service)
    if not verify_user_password(user_id, current_password):
        raise HTTPException(status_code=401, detail="Current password incorrect")
    set_user_password(user_id, new_password)
    return {"success": True}


# Get user profile (all fields)
@router.get("/users/{user_id}/profile")
def get_user_profile(user_id: str):
    user_ref = firestore_db.collection('users').document(user_id)
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    data = doc.to_dict()
    data['id'] = user_id
    # Map snake_case to camelCase for frontend compatibility
    if 'first_name' in data:
        data['firstName'] = data['first_name']
    if 'last_name' in data:
        data['lastName'] = data['last_name']
    return data

# Toggle 2FA
@router.post("/users/{user_id}/2fa")
def toggle_2fa(user_id: str, data: dict = Body(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    enabled = data.get("enabled", False)
    user_ref.update({"twoFAEnabled": enabled})
    return {"success": True, "twoFAEnabled": enabled}



from fastapi import Query

@router.get("/users")
def get_users(skip: int = Query(0, ge=0), limit: int = Query(20, le=100)):
    from google.cloud import firestore
    users_ref = firestore_db.collection('users')
    # Only fetch required fields for low-bandwidth optimization
    fields = ["email", "first_name", "last_name"]
    query = users_ref.select(fields).order_by("email")
    docs = query.offset(skip).limit(limit).stream()
    users = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        if 'first_name' in data:
            data['firstName'] = data['first_name']
        if 'last_name' in data:
            data['lastName'] = data['last_name']
        users.append(data)
    return users

@router.get("/users/{user_id}/settings")
def get_user_settings(user_id: str):
    user_ref = firestore_db.collection('users').document(user_id)
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    data = doc.to_dict()
    settings = data.get('settings', {})
    return settings

@router.post("/users/{user_id}/settings")
def save_user_settings(user_id: str, settings: dict = Body(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_ref.update({"settings": settings})
    return {"success": True}

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_ref.delete()
    return

@router.patch("/users/{user_id}/block")
def block_user(user_id: str, block: bool = Query(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_ref.update({"isActive": not block})
    return {"success": True, "blocked": block}

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: str, role: str):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_ref.update({"role": role})
    return {"success": True, "role": role}

@router.patch("/users/{user_id}/verify-driver")
def verify_driver(user_id: str, verified: bool):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_ref.update({"driverVerified": verified})
    return {"success": True, "driverVerified": verified}

# Add/Update profile photo URL
@router.patch("/users/{user_id}/profile-photo")
def update_profile_photo(user_id: str, data: dict = Body(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    photo_url = data.get("photoUrl")
    if not photo_url:
        raise HTTPException(status_code=400, detail="Missing photoUrl")
    user_ref.update({"photoUrl": photo_url})
    return {"success": True, "photoUrl": photo_url}

# Add/Update phone number (no verification yet)
@router.patch("/users/{user_id}/phone")
def update_phone(user_id: str, data: dict = Body(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    phone = data.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Missing phone")
    user_ref.update({"phone": phone})
    return {"success": True, "phone": phone}

# Update address and other details
@router.patch("/users/{user_id}/details")
def update_details(user_id: str, details: dict = Body(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    allowed = {k: v for k, v in details.items() if k in ["address", "dob", "gender", "city", "state", "zip"]}
    user_ref.update(allowed)
    return {"success": True}

# Notification preferences (update in settings)
@router.patch("/users/{user_id}/notification-preferences")
def update_notification_preferences(user_id: str, prefs: dict = Body(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_ref.update({"settings.notifications": prefs})
    return {"success": True}

# Activity log (dummy, for demo)
@router.get("/users/{user_id}/activity-log")
def get_activity_log(user_id: str):
    # In real app, fetch from a log collection
    return [
        {"type": "login", "timestamp": "2025-09-06T10:00:00Z"},
        {"type": "password_change", "timestamp": "2025-09-05T18:30:00Z"},
        {"type": "2fa_enabled", "timestamp": "2025-09-04T15:00:00Z"},
    ]

# Delete account (requires email OTP and 2FA)
@router.post("/users/{user_id}/delete-account")
def delete_account(user_id: str, data: dict = Body(...)):
    user_ref = firestore_db.collection('users').document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    email_otp = data.get("emailOtp")
    twofa_otp = data.get("twofaOtp")
    if not email_otp or not twofa_otp:
        raise HTTPException(status_code=400, detail="OTP required")
    # Real OTP/2FA verification
    if not verify_delete_account_otps(user_id, email_otp, twofa_otp):
        raise HTTPException(status_code=401, detail="Invalid or expired OTPs")
    user_ref.delete()
    return {"success": True}

# Simple reward points endpoint
@router.get("/users/{user_id}/rewards")
def get_user_rewards(user_id: str):
    user_ref = firestore_db.collection('users').document(user_id)
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    data = doc.to_dict()
    points = data.get('points', 0)
    return {"points": points}
