from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from enum import Enum
from passlib.context import CryptContext
import random
import time
import threading
from app.firebase import firestore_db
from app.email_utils import send_otp_email
from app.utils.auth import hash_password

router = APIRouter()

# ==========================
# OTP Hashing
# ==========================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_otp(otp: str) -> str:
    return pwd_context.hash(otp)

def verify_otp_hash(otp: str, hashed_otp: str) -> bool:
    return pwd_context.verify(otp, hashed_otp)


# ==========================
# Enum for Purpose
# ==========================
class OtpPurpose(str, Enum):
    register = "register"
    forgot_password = "forgot_password"
    twofa = "2fa"


# ==========================
# Request Models
# ==========================
class SendOtpRequest(BaseModel):
    email: EmailStr
    purpose: OtpPurpose

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str
    purpose: OtpPurpose

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


# ==========================
# Constants
# ==========================
OTP_COLLECTION = "otp_temp"
MAX_OTP_ATTEMPTS = 3
OTP_EXPIRY = 300       # 5 min
RESEND_COOLDOWN = 60   # 1 min


# ==========================
# Helpers for Responses
# ==========================
def error_response(code: str, message: str):
    return {"success": False, "code": code, "message": message}

def cooldown_response(wait_time: int):
    return error_response("COOLDOWN_ACTIVE", f"Please wait {wait_time} seconds before requesting another OTP.")


# ==========================
# Common OTP Validator
# ==========================
def validate_otp(email: str, otp: str, purpose: str):
    doc_ref = firestore_db.collection(OTP_COLLECTION).document(email)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail=error_response("OTP_NOT_FOUND", "OTP not found. Please request a new one.", field="otp")
        )

    otp_data = doc.to_dict()
    now = int(time.time())

    # Expiry check
    if now - otp_data.get("created_at", 0) > OTP_EXPIRY:
        doc_ref.delete()
        raise HTTPException(
            status_code=410,
            detail=error_response("OTP_EXPIRED", "Your OTP has expired. Please request a new one.", field="otp")
        )

    # Attempt check
    attempts = otp_data.get("attempts", 0)
    if attempts >= MAX_OTP_ATTEMPTS:
        doc_ref.delete()
        raise HTTPException(
            status_code=429,
            detail=error_response("TOO_MANY_ATTEMPTS", "Too many invalid attempts. Please request a new OTP.", field="otp")
        )

    # Hash check
    if not verify_otp_hash(otp, otp_data["otp"]) or otp_data["purpose"] != purpose:
        doc_ref.update({"attempts": attempts + 1})
        raise HTTPException(
            status_code=400,
            detail=error_response("INVALID_OTP", "The OTP entered is incorrect or does not match the request purpose.", field="otp")
        )


    doc_ref.update({"otp_verified": True})
    # Only delete OTP doc for non-registration purposes
    if purpose != "register":
        doc_ref.delete()
    return True

# ==========================
# Error Response with Field 
# ==========================

def error_response(code: str, message: str, field: str = None):
    resp = {"success": False, "code": code, "message": message}
    if field:
        resp["field"] = field
    return resp

# ==========================
# Routes
# ==========================
@router.post("/send-otp")
def send_otp(data: SendOtpRequest, background_tasks: BackgroundTasks):
    """
    Send an OTP to a user's email for registration, password reset, or 2FA.
    Args:
        data (SendOtpRequest): Email and purpose for OTP.
        background_tasks (BackgroundTasks): For async email sending.
    Returns:
        dict: Success status, message, and timestamp.
    """
    try:
        users = firestore_db.collection("users").where("email", "==", data.email).stream()
        user_exists = any(users)

        if data.purpose == OtpPurpose.register and user_exists:
            raise HTTPException(
                status_code=409,
                detail=error_response("ALREADY_REGISTERED", "This email is already registered.", field="email")
            )
        if data.purpose in [OtpPurpose.forgot_password, OtpPurpose.twofa] and not user_exists:
            raise HTTPException(
                status_code=404,
                detail=error_response(
                    "USER_NOT_FOUND",
                    "You are not registered with us. Please make sure your email is correct.",
                    field="email"
                )
            )

        # Cooldown check
        doc_ref = firestore_db.collection(OTP_COLLECTION).document(data.email)
        existing = doc_ref.get()
        now = int(time.time())
        if existing.exists:
            prev = existing.to_dict()
            elapsed = now - prev.get("created_at", 0)
            if elapsed < RESEND_COOLDOWN:
                wait_time = RESEND_COOLDOWN - elapsed
                raise HTTPException(status_code=429, detail=cooldown_response(wait_time))

        # Generate OTP + hash
        otp = str(random.randint(100000, 999999))
        hashed_otp = hash_otp(otp)

        # Store in Firestore
        doc_ref.set({
            "otp": hashed_otp,
            "purpose": data.purpose,
            "created_at": now,
            "attempts": 0
        })

        # Send async email
        name = data.email.split("@")[0]
        background_tasks.add_task(send_otp_email, data.email, name, otp, data.purpose)

        return {"success": True, "message": "OTP sent to email", "timestamp": now}
    except Exception as e:
        print(f"[ERROR] send_otp: {e}")
        raise HTTPException(
            status_code=500,
            detail=error_response("SERVER_ERROR", "An unexpected error occurred. Please try again later.")
        )


@router.post("/resend-otp")
def resend_otp(data: SendOtpRequest, background_tasks: BackgroundTasks):
    """
    Resend an OTP to a user's email for the same purpose as the original request.
    Args:
        data (SendOtpRequest): Email and purpose for OTP.
        background_tasks (BackgroundTasks): For async email sending.
    Returns:
        dict: Success status, message, and timestamp.
    """
    doc_ref = firestore_db.collection(OTP_COLLECTION).document(data.email)
    existing = doc_ref.get()
    now = int(time.time())

    if not existing.exists:
        raise HTTPException(status_code=404, detail=error_response("OTP_NOT_FOUND", "No OTP found. Please use /send-otp first."))

    prev = existing.to_dict()

    # Ensure purpose matches original
    if prev.get("purpose") != data.purpose:
        raise HTTPException(status_code=400, detail=error_response("PURPOSE_MISMATCH", "OTP resend must use the same purpose as the original request."))

    elapsed = now - prev.get("created_at", 0)
    if elapsed < RESEND_COOLDOWN:
        wait_time = RESEND_COOLDOWN - elapsed
        raise HTTPException(status_code=429, detail=cooldown_response(wait_time))

    # Generate new OTP
    otp = str(random.randint(100000, 999999))
    hashed_otp = hash_otp(otp)

    # Overwrite Firestore doc
    doc_ref.set({
        "otp": hashed_otp,
        "purpose": data.purpose,
        "created_at": now,
        "attempts": 0
    })

    # Send async email
    name = data.email.split("@")[0]
    background_tasks.add_task(send_otp_email, data.email, name, otp, data.purpose)

    return {"success": True, "message": "OTP resent successfully", "timestamp": now}

@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest):
    """
    Verify an OTP for a given email and purpose.
    Args:
        data (VerifyOtpRequest): Email, OTP, and purpose.
    Returns:
        dict: Success status and message.
    """
    try:
        validate_otp(data.email, data.otp, data.purpose)
        return {"success": True, "message": "OTP verified"}
    except HTTPException as e:
        # Pass through known errors
        raise e
    except Exception as e:
        print(f"[ERROR] verify_otp: {e}")
        raise HTTPException(
            status_code=500,
            detail=error_response("SERVER_ERROR", "An unexpected error occurred. Please try again later.")
        )


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    """
    Reset a user's password after OTP verification.
    Args:
        data (ResetPasswordRequest): Email, OTP, and new password.
    Returns:
        dict: Success status and message.
    """
    # Verify OTP first
    validate_otp(data.email, data.otp, OtpPurpose.forgot_password)

    # Find user by email
    users = firestore_db.collection("users").where("email", "==", data.email).stream()
    user_doc = next(users, None)

    if not user_doc:
        raise HTTPException(status_code=404, detail=error_response("USER_NOT_FOUND", "User not found."))

    # Hash the new password before saving
    firestore_db.collection("users").document(user_doc.id).update({
        "password": hash_password(data.new_password)
    })

    return {"success": True, "message": "Password reset successful"}

def cleanup_expired_otps():
    while True:
        try:
            now = int(time.time())
            otp_docs = firestore_db.collection(OTP_COLLECTION).stream()
            deleted = 0
            for doc in otp_docs:
                data = doc.to_dict()
                if now - data.get("created_at", 0) > OTP_EXPIRY:
                    firestore_db.collection(OTP_COLLECTION).document(doc.id).delete()
                    deleted += 1
            if deleted > 0:
                print(f"[CLEANUP] Deleted {deleted} expired OTPs")
        except Exception as e:
            print(f"[ERROR] OTP cleanup failed: {e}")

        time.sleep(60)  # run every 1 minute


# Start cleanup thread when app launches
def start_cleanup_task():
    thread = threading.Thread(target=cleanup_expired_otps, daemon=True)
    thread.start()