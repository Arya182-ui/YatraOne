from app.firebase import firestore_db
from google.cloud.firestore_v1.base_document import DocumentSnapshot
from typing import Optional
from app.utils.auth import verify_password, hash_password
import time

OTP_COLLECTION = 'otp_temp'


def increment_login_counter_and_points(user_id: str):
    """
    Increment the user's login counter and award points every 5 logins.
    Args:
        user_id (str): User's unique ID.
    Returns:
        int | None: New login count, or None if user not found.
    """
    user_ref = firestore_db.collection("users").document(user_id)
    doc = user_ref.get()
    if not doc.exists:
        return
    data = doc.to_dict()
    login_count = data.get("login_count", 0) + 1
    user_ref.update({"login_count": login_count})
    if login_count % 5 == 0:
        current_points = data.get("points", 0)
        user_ref.update({"points": current_points + 1})
    return login_count

def create_user(user_data: dict) -> str:
    """
    Create a new user in Firestore, hashing password if present.
    Args:
        user_data (dict): User fields (must include email, password, etc.)
    Returns:
        str: User ID of the created user.
    """
    user_id = user_data.get('id')
    if not user_id:
        import uuid
        user_id = f"user{uuid.uuid4().hex[:8]}"
    doc_ref = firestore_db.collection("users").document(user_id)
    user_data["id"] = user_id
    if 'password' in user_data:
        user_data['password'] = hash_password(user_data['password'])
    user_data.setdefault('firstName', '')
    user_data.setdefault('lastName', '')
    user_data.setdefault('phone', '')
    user_data.setdefault('isActive', True)
    doc_ref.set(user_data)
    return user_id

def get_user_by_email(email: str) -> Optional[dict]:
    """
    Retrieve a user by email address.
    Args:
        email (str): User's email address.
    Returns:
        dict | None: User dict if found, else None.
    """
    users = firestore_db.collection("users").where("email", "==", email).stream()
    for user in users:
        return user.to_dict() | {"id": user.id}
    return None

def verify_delete_account_otps(user_id: str, email_otp: str, twofa_otp: str) -> bool:
    """
    Verifies both email OTP and 2FA OTP for account deletion.
    Email OTP is stored with key = user's email, purpose = 'delete_account'.
    2FA OTP is stored with key = user's email, purpose = '2fa'.
    Args:
        user_id (str): User's unique ID.
        email_otp (str): OTP sent to user's email.
        twofa_otp (str): OTP from 2FA app/device.
    Returns:
        bool: True if both OTPs are valid, else False.
    """
    user = get_user_by_id(user_id)
    if not user:
        return False
    email = user.get('email')
    now = int(time.time())
    email_doc = firestore_db.collection(OTP_COLLECTION).document(email).get()
    if not email_doc.exists:
        return False
    email_otp_data = email_doc.to_dict()
    if (
        email_otp_data.get('otp') != email_otp or
        email_otp_data.get('purpose') != 'delete_account' or
        now - email_otp_data.get('created_at', 0) > 300
    ):
        return False
    twofa_doc = firestore_db.collection(OTP_COLLECTION).document(email + '_2fa').get()
    if not twofa_doc.exists:
        return False
    twofa_otp_data = twofa_doc.to_dict()
    if (
        twofa_otp_data.get('otp') != twofa_otp or
        twofa_otp_data.get('purpose') != '2fa' or
        now - twofa_otp_data.get('created_at', 0) > 300
    ):
        return False
    firestore_db.collection(OTP_COLLECTION).document(email).delete()
    firestore_db.collection(OTP_COLLECTION).document(email + '_2fa').delete()
    return True

def get_user_by_id(user_id: str) -> Optional[dict]:
    """
    Retrieve a user by their unique ID.
    Args:
        user_id (str): User's unique ID.
    Returns:
        dict | None: User dict if found, else None.
    """
    doc = firestore_db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict() | {"id": doc.id}
    return None

def verify_user_password(user_id: str, password: str) -> bool:
    """
    Verify a user's password by user ID.
    Args:
        user_id (str): User's unique ID.
        password (str): Plaintext password to verify.
    Returns:
        bool: True if password matches, else False.
    """
    user = get_user_by_id(user_id)
    if user and 'password' in user:
        return verify_password(password, user['password'])
    return False

def set_user_password(user_id: str, password: str):
    """
    Set a new password for a user (hashed).
    Args:
        user_id (str): User's unique ID.
        password (str): New plaintext password.
    """
    hashed = hash_password(password)
    firestore_db.collection("users").document(user_id).update({"password": hashed})