import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    Args:
        password (str): Plaintext password.
    Returns:
        str: Bcrypt hashed password.
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    Args:
        plain_password (str): Plaintext password.
        hashed_password (str): Bcrypt hashed password.
    Returns:
        bool: True if match, False otherwise.
    """
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))