from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Feedback(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # complaint, suggestion, compliment, other
    subject: str
    message: str
    status: str = "open"  # open, in_progress, resolved
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
