from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.email_utils import send_template_email

router = APIRouter()

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.post("/contact")
def contact_us(data: ContactRequest):
    try:
        send_template_email(
            to_email=data.email,
            subject="Contact Request Received - YatraOne",
            template_name="contact_user.html",
            context={"name": data.name, "message": data.message}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")
    return {"success": True, "message": "Contact request received. Email sent."}
