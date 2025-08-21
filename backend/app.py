from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from users.users import create_user
from authentication.authh import authenticate_user_detailed, create_access_token, get_current_user, update_last_login
from users.profiles import get_therapist_profile, get_parent_profile, update_therapist_profile, update_parent_profile
import psycopg2
from typing import Optional
from datetime import timedelta

app = FastAPI(title="ThrivePath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: str
    name: Optional[str] = None  # Added to include full name from profile

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserRegistration(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    emergencyContact: Optional[str] = None

class TherapistProfile(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    created_at: str

class ParentProfile(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    is_active: bool
    created_at: str

class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None  # For therapists
    address: Optional[str] = None  # For parents
    emergency_contact: Optional[str] = None  # For parents

@app.post("/api/login", response_model=LoginResponse)
async def login_user(user_credentials: UserLogin):
    """
    Login user and return JWT token
    """
    try:
        # Authenticate user with detailed error messages
        user, error_message = authenticate_user_detailed(user_credentials.email, user_credentials.password)
        
        if not user:
            if error_message == "User not found":
                raise HTTPException(
                    status_code=404,
                    detail="User not found. Please check your email or register for a new account."
                )
            elif error_message == "Invalid password":
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password. Please check your credentials."
                )
            elif error_message == "Account is inactive":
                raise HTTPException(
                    status_code=403,
                    detail="Your account is inactive. Please contact support."
                )
            else:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication failed"
                )
        
        # Update last login
        update_last_login(user["id"])
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": str(user["id"]),  # Convert to string for JWT
                "email": user["email"], 
                "role": user["role"]
            }
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                role=user["role"],
                is_active=user["is_active"],
                is_verified=user["is_verified"],
                created_at=user.get("created_at", "").isoformat() if user.get("created_at") else ""
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/register", response_model=UserResponse)
async def register_user(user_data: UserRegistration):
    """
    Register a new user in the system
    """
    try:
        # Validate role
        if user_data.role not in ["therapist", "parent"]:
            raise HTTPException(status_code=400, detail="Invalid role. Must be 'therapist' or 'parent'")
        
        # Create user in database with profile data
        new_user = create_user(
            email=user_data.email,
            password=user_data.password,
            role=user_data.role,
            first_name=user_data.firstName,
            last_name=user_data.lastName,
            phone=user_data.phone,
            address=user_data.address,
            emergency_contact=user_data.emergencyContact
        )
        
        return UserResponse(
            id=new_user["id"],
            email=new_user["email"],
            role=new_user["role"],
            is_active=new_user["is_active"],
            is_verified=new_user["is_verified"],
            created_at=new_user["created_at"].isoformat()
        )
        
    except psycopg2.IntegrityError as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already exists")
        raise HTTPException(status_code=400, detail="Database error occurred")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information with profile data
    """
    # Get profile data to include name
    profile_name = None
    try:
        if current_user["role"] == "therapist":
            profile = get_therapist_profile(current_user["id"])
            if profile:
                profile_name = f"{profile['first_name']} {profile['last_name']}"
        elif current_user["role"] == "parent":
            profile = get_parent_profile(current_user["id"])
            if profile:
                profile_name = f"{profile['first_name']} {profile['last_name']}"
    except Exception as e:
        # If profile fetch fails, continue without name
        print(f"Warning: Could not fetch profile for user {current_user['id']}: {e}")
    
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        role=current_user["role"],
        is_active=current_user["is_active"],
        is_verified=current_user["is_verified"],
        created_at=current_user.get("created_at", "").isoformat() if current_user.get("created_at") else "",
        name=profile_name or current_user["email"]  # Fallback to email if no profile name
    )

@app.get("/api/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile information
    """
    try:
        if current_user["role"] == "therapist":
            profile = get_therapist_profile(current_user["id"])
            if not profile:
                raise HTTPException(status_code=404, detail="Therapist profile not found")
            return TherapistProfile(**{
                **profile,
                "created_at": profile["created_at"].isoformat() if profile["created_at"] else ""
            })
        elif current_user["role"] == "parent":
            profile = get_parent_profile(current_user["id"])
            if not profile:
                raise HTTPException(status_code=404, detail="Parent profile not found")
            return ParentProfile(**{
                **profile,
                "created_at": profile["created_at"].isoformat() if profile["created_at"] else ""
            })
        else:
            raise HTTPException(status_code=400, detail="Invalid user role")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get profile")

@app.put("/api/profile")
async def update_user_profile(
    profile_data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user's profile information
    """
    try:
        update_data = profile_data.dict(exclude_unset=True)
        
        if current_user["role"] == "therapist":
            updated_profile = update_therapist_profile(current_user["id"], **update_data)
            if not updated_profile:
                raise HTTPException(status_code=404, detail="Therapist profile not found")
            return TherapistProfile(**{
                **updated_profile,
                "created_at": updated_profile["created_at"].isoformat() if updated_profile["created_at"] else ""
            })
        elif current_user["role"] == "parent":
            updated_profile = update_parent_profile(current_user["id"], **update_data)
            if not updated_profile:
                raise HTTPException(status_code=404, detail="Parent profile not found")
            return ParentProfile(**{
                **updated_profile,
                "created_at": updated_profile["created_at"].isoformat() if updated_profile["created_at"] else ""
            })
        else:
            raise HTTPException(status_code=400, detail="Invalid user role")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update profile")

@app.get("/")
async def root():
    return {"message": "ThrivePath API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ThrivePath API"}

if __name__ == "__main__":
    import uvicorn
    print("Starting ThrivePath API server...")
    uvicorn.run(
        "app:app",  
        host="0.0.0.0", 
        port=8000, 
        reload=True,  
        log_level="info"
    )