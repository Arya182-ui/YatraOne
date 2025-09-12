from fastapi import APIRouter, HTTPException, status, Depends, Request, Response
from app.rate_limit import limiter
from app.models.user import User
from app.services import user_service
from pydantic import EmailStr, BaseModel, Field
import bcrypt
from app.utils.auth import verify_password, hash_password
from app.firebase import firestore_db
from app.utils.jwt_utils import create_access_token, create_refresh_token, verify_token
from app.utils.token_blacklist import blacklist
from app.utils.password_policy import validate_password
from app.utils.audit_log import log_action
import uuid
from datetime import timedelta, datetime

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    password: str = Field(..., min_length=8)

class RefreshTokenRequest(BaseModel):
    refresh_token: str
    
class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    phone: str = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict

@router.post("/register", response_model=TokenResponse, tags=["Auth"])
@limiter.limit("3/minute")
def register(data: RegisterRequest, request: Request):
    """
    Register a new user after OTP verification.
    Args:
        data (RegisterRequest): User registration fields.
        request (Request): FastAPI request object for logging.
    Returns:
        dict: JWT access/refresh tokens and user info.
    """
    # Check OTP verification
    otp_doc = firestore_db.collection("otp_temp").document(data.email).get()
    if not otp_doc.exists or not otp_doc.to_dict().get("otp_verified"):
        raise HTTPException(status_code=400, detail="Please verify your email with OTP before registering.")

    existing = user_service.get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    validate_password(data.password)
    user_data = data.dict()
    user_data["isActive"] = True
    hashed_pw = hash_password(user_data["password"])
    user_data["password"] = hashed_pw

    # Firestore batch for atomic registration
    batch = firestore_db.batch()
    user_id = str(uuid.uuid4())
    user_ref = firestore_db.collection("users").document(user_id)
    otp_ref = firestore_db.collection("otp_temp").document(data.email)
    log_ref = firestore_db.collection("audit_logs").document()
    batch.set(user_ref, user_data)
    batch.delete(otp_ref)
    batch.set(log_ref, {
        "user_id": user_id,
        "action": "register",
        "ip": request.client.host,
        "timestamp": datetime.utcnow().isoformat()
    })
    batch.commit()
    user_data["id"] = user_id

    # JWT tokens
    jti = str(uuid.uuid4())
    access_token = create_access_token({"sub": user_id, "email": data.email, "jti": jti})
    refresh_token = create_refresh_token({"sub": user_id, "email": data.email, "jti": jti})

    try:
        from app.email_utils import send_template_email
        send_template_email(
            to_email=data.email,
            subject="Welcome to YatraOne Public Transport!",
            template_name="welcome.html",
            context={
                "name": f"{data.firstName} {data.lastName}",
                "email": data.email
            }
        )
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

    user_data.pop("password", None)
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user_data}


@router.post("/login", response_model=TokenResponse, tags=["Auth"])
@limiter.limit("5/minute")
def login(data: LoginRequest, request: Request, response: Response):
    """
    Authenticate user and return JWT tokens.
    Args:
        data (LoginRequest): Login credentials.
        request (Request): FastAPI request object for logging.
    Returns:
        dict: JWT access/refresh tokens and user info.
    """
    user = user_service.get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    hashed_pw = user.get("password")
    if not hashed_pw or not verify_password(data.password, hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # JWT tokens with rotation
    jti = str(uuid.uuid4())
    access_token = create_access_token({"sub": user["id"], "email": user["email"], "jti": jti})
    refresh_token = create_refresh_token({"sub": user["id"], "email": user["email"], "jti": jti})

    # CSRF protection: generate random CSRF token and set as non-HttpOnly cookie
    import secrets
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=True,
        samesite="Lax",
        max_age=60*60*24*7,  # 7 days
        path="/api/auth/refresh-token"
    )

    # Set refresh token as httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=60*60*24*7,  # 7 days
        path="/api/auth/refresh-token"
    )

    # Audit log
    log_action(user["id"], "login", {"ip": request.client.host})

    user.pop("password", None)
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}


@router.post("/refresh-token", tags=["Auth"])
def refresh_token_endpoint(request: Request, response: Response):
    """
    Refresh JWT access and refresh tokens using a valid refresh token from httpOnly cookie.
    """
    refresh_token = request.cookies.get("refresh_token")
    csrf_token_cookie = request.cookies.get("csrf_token")
    csrf_token_header = request.headers.get("x-csrf-token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token cookie")
    if not csrf_token_cookie or not csrf_token_header or csrf_token_cookie != csrf_token_header:
        raise HTTPException(status_code=403, detail="CSRF token missing or invalid")
    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    jti = payload.get("jti")
    exp = payload.get("exp")
    if blacklist.contains(jti):
        raise HTTPException(status_code=401, detail="Refresh token revoked")
    # Rotate token: blacklist old, issue new
    exp_seconds = int(exp - datetime.utcnow().timestamp()) if exp else 60*60*24*7
    blacklist.add(jti, exp_seconds)
    new_jti = str(uuid.uuid4())
    access_token = create_access_token({"sub": payload["sub"], "email": payload["email"], "jti": new_jti})
    new_refresh_token = create_refresh_token({"sub": payload["sub"], "email": payload["email"], "jti": new_jti})
    import secrets
    new_csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=60*60*24*7,
        path="/api/auth/refresh-token"
    )
    response.set_cookie(
        key="csrf_token",
        value=new_csrf_token,
        httponly=False,
        secure=True,
        samesite="Lax",
        max_age=60*60*24*7,
        path="/api/auth/refresh-token"
    )
    return {"access_token": access_token}


@router.post("/logout", tags=["Auth"])
def logout(refresh_token: str):
    """
    Logout user by blacklisting the refresh token.
    Args:
        refresh_token (str): JWT refresh token to blacklist.
    Returns:
        dict: Success message.
    """
    payload = verify_token(refresh_token)
    if payload:
        jti = payload.get("jti")
        blacklist.add(jti)
    return {"success": True, "message": "Logged out everywhere."}
