import re
from fastapi import HTTPException

def validate_password(password: str):
    """
    Validate password strength according to policy:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    Raises HTTPException if invalid.
    Args:
        password (str): Password to validate.
    """
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain an uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain a lowercase letter.")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain a number.")
    if not re.search(r"[!@#$%^&*()_+\-\=\[\]{};':\",.<>/?]", password):
        raise HTTPException(status_code=400, detail="Password must contain a special character.")
