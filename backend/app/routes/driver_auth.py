from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from app.firebase import firestore_db
from app.utils.auth import hash_password, verify_password
import uuid
from datetime import datetime

router = APIRouter()

class DriverSignupRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    phone: str = None

class DriverLoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/driver/signup", tags=["Driver"])
def driver_signup(data: DriverSignupRequest, request: Request):
    # Check if driver already exists
    existing = firestore_db.collection("users").where("email", "==", data.email).get()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_data = data.dict()
    user_data["role"] = "driver"
    user_data["isActive"] = True
    user_data["createdAt"] = datetime.utcnow().isoformat()
    user_data["password"] = hash_password(user_data["password"])
    firestore_db.collection("users").document(user_id).set(user_data)
    user_data["id"] = user_id
    user_data.pop("password", None)
    return {"user": user_data, "message": "Driver registered successfully."}

@router.post("/driver/login", tags=["Driver"])
def driver_login(data: DriverLoginRequest, request: Request):
    users = firestore_db.collection("users").where("email", "==", data.email).where("role", "==", "driver").get()
    if not users:
        raise HTTPException(status_code=404, detail="Driver not found")
    user_doc = users[0]
    user = user_doc.to_dict()
    if not verify_password(data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user["id"] = user_doc.id
    user.pop("password", None)
    return {"user": user, "message": "Login successful."}
