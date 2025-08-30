import os
# import psycopg2
from dotenv import load_dotenv
from users.profiles import get_therapist_profile, get_parent_profile
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from jwt import PyJWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db import get_supabase_client, format_supabase_response, handle_supabase_error
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user from database by email with profile data using Supabase"""
    try:
        client = get_supabase_client()
        
        # Get user data using Supabase
        response = client.table('users').select('*').eq('email', email).execute()
        handle_supabase_error(response)
        
        users = format_supabase_response(response)
        if not users:
            return None
            
        user = users[0]
        
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
    except Exception as e:
        logger.error(f"Error getting user by email {email}: {e}")
        return None

# COMMENTED OUT: Direct PostgreSQL version (keeping for reference)
# def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
#     """Get user from database by email with profile data"""
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute(
#                 "SELECT id, email, password_hash, role, is_active, is_verified, created_at FROM users WHERE email = %s",
#                 (email,)
#             )
#             user = cur.fetchone()
#             
#             if user:
#                 # Get profile data based on role
#                 if user["role"] == "therapist":
#                     profile = get_therapist_profile(user["id"])
#                 elif user["role"] == "parent":
#                     profile = get_parent_profile(user["id"])
#                 else:
#                     profile = None
#                 
#                 if profile:
#                     user["profile"] = profile
#             
#             return user
#     finally:
#         conn.close()

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    if not user["is_active"]:
        return None
    return user

def authenticate_user_detailed(email: str, password: str) -> tuple[Optional[Dict[str, Any]], str]:
    """
    Authenticate user with detailed error messages using Supabase
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
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if user_id is None or email is None:
            raise credentials_exception
            
        return {
            "id": user_id,
            "email": email,
            "role": role
        }
    except PyJWTError:
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
    """Update user's last login timestamp using Supabase"""
    try:
        client = get_supabase_client()
        
        response = client.table('users').update({
            'last_login': datetime.utcnow().isoformat()
        }).eq('id', user_id).execute()
        
        handle_supabase_error(response)
        logger.info(f"Updated last login for user {user_id}")
    except Exception as e:
        logger.error(f"Error updating last login for user {user_id}: {e}")

# COMMENTED OUT: Direct PostgreSQL version (keeping for reference)
# def update_last_login(user_id: int):
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute(
#                 "UPDATE users SET last_login = NOW() WHERE id = %s",
#                 (user_id,)
#             )
#         conn.commit()
#     finally:
#         conn.close()
