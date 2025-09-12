from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: str | None = None
    email: EmailStr
    firstName: str
    lastName: str
    password: str
    role: str = "user"
    phone: str | None = None
    isActive: bool = True
    