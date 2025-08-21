import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from jwt import PyJWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db import get_db_connection
import psycopg2
from dotenv import load_dotenv
from users.profiles import get_therapist_profile, get_parent_profile

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user from database by email with profile data"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, email, password_hash, role, is_active, is_verified, created_at FROM users WHERE email = %s",
                (email,)
            )
            user = cur.fetchone()
            
            if user:
                # Get profile data based on role
                if user["role"] == "therapist":
                    profile = get_therapist_profile(user["id"])
                elif user["role"] == "parent":
                    profile = get_parent_profile(user["id"])
                else:
                    profile = None
                
                if profile:
                    user["profile"] = profile
            
            return user
    finally:
        conn.close()


def authenticate_user_detailed(email: str, password: str) -> tuple[Optional[Dict[str, Any]], str]:
    """
    Authenticate user with detailed error messages
    Returns: (user_data, error_message)
    """
    user = get_user_by_email(email)
    if not user:
        return None, "User not found"
    
    if not verify_password(password, user["password_hash"]):
        return None, "Invalid password"
    
    if not user["is_active"]:
        return None, "Account is inactive"
    
    return user, ""

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        print(f"DEBUG: Received token: {credentials.credentials[:20]}...")  # Debug log
        print(f"DEBUG: SECRET_KEY exists: {SECRET_KEY is not None}")  # Debug log
        
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        print(f"DEBUG: Decoded payload - user_id_str: {user_id_str}, email: {email}, role: {role}")  # Debug log
        
        if user_id_str is None or email is None:
            print("DEBUG: Missing user_id or email in token")  # Debug log
            raise credentials_exception
        
        # Convert user_id from string to int
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            print(f"DEBUG: Invalid user_id format: {user_id_str}")  # Debug log
            raise credentials_exception
            
        return {
            "id": user_id,
            "email": email,
            "role": role
        }
    except PyJWTError as e:
        print(f"DEBUG: JWT Error: {e}")  # Debug log
        raise credentials_exception

def get_current_user(token_data: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
    user = get_user_by_email(token_data["email"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

def update_last_login(user_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET last_login = NOW() WHERE id = %s",
                (user_id,)
            )
        conn.commit()
    finally:
        conn.close()
