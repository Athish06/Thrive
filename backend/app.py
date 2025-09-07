from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from users.users import create_user
from authentication.authh import authenticate_user_detailed, create_access_token, get_current_user, update_last_login
from users.profiles import get_therapist_profile, get_parent_profile, update_therapist_profile, update_parent_profile
from students.students import get_all_students, get_student_by_id, get_students_by_therapist, enroll_student
from notes.notes import get_notes_by_date_and_therapist, create_session_note, get_notes_with_dates_for_therapist, SessionNoteCreate, SessionNoteResponse
from sessions.sessions import (
    create_session, get_sessions_by_therapist, get_session_by_id, update_session, delete_session,
    add_activity_to_session, get_session_activities, get_available_student_activities, 
    remove_activity_from_session, SessionCreate, SessionUpdate, SessionResponse,
    SessionActivityCreate, SessionActivityUpdate, SessionActivityResponse, StudentActivityResponse
)
# import psycopg2  # Commented out - using Supabase now
from typing import Optional, List
from datetime import timedelta, date
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ThrivePath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
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
    # Additional parent-specific fields
    parentFirstName: Optional[str] = None
    parentLastName: Optional[str] = None
    childFirstName: Optional[str] = None
    childLastName: Optional[str] = None
    childDob: Optional[str] = None
    relationToChild: Optional[str] = None
    alternatePhone: Optional[str] = None
    addressLine1: Optional[str] = None
    addressLine2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    country: Optional[str] = None

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

class StudentResponse(BaseModel):
    id: int
    name: str
    firstName: str
    lastName: str
    age: Optional[int] = None
    dateOfBirth: Optional[str] = None
    enrollmentDate: Optional[str] = None
    diagnosis: Optional[str] = None
    status: str
    primaryTherapist: Optional[str] = None
    primaryTherapistId: Optional[int] = None
    profileDetails: Optional[dict] = None
    photo: Optional[str] = None
    progressPercentage: Optional[int] = 75
    nextSession: Optional[str] = None
    goals: Optional[List[str]] = []

class StudentEnrollment(BaseModel):
    firstName: str
    lastName: str
    dateOfBirth: str
    diagnosis: Optional[str] = None
    age: Optional[int] = None
    goals: Optional[List[str]] = []
    therapistId: int

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
                created_at=str(user.get("created_at", ""))
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        logger.error(f"User data: {user}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

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
            emergency_contact=user_data.emergencyContact,
            # Pass additional parent fields
            parent_first_name=user_data.parentFirstName,
            parent_last_name=user_data.parentLastName,
            child_first_name=user_data.childFirstName,
            child_last_name=user_data.childLastName,
            child_dob=user_data.childDob,
            relation_to_child=user_data.relationToChild,
            alternate_phone=user_data.alternatePhone,
            address_line1=user_data.addressLine1,
            address_line2=user_data.addressLine2,
            city=user_data.city,
            state=user_data.state,
            postal_code=user_data.postalCode,
            country=user_data.country
        )
        
        return UserResponse(
            id=new_user["id"],
            email=new_user["email"],
            role=new_user["role"],
            is_active=new_user["is_active"],
            is_verified=new_user["is_verified"],
            created_at=str(new_user.get("created_at", ""))
        )
        
    # COMMENTED OUT: psycopg2 specific error handling - replaced with general exception handling
    # except psycopg2.IntegrityError as e:
    #     if "unique constraint" in str(e).lower():
    #         raise HTTPException(status_code=400, detail="Email already exists")
    #     raise HTTPException(status_code=400, detail="Database error occurred")
    except ValueError as e:
        # This handles email already exists and other validation errors from Supabase
        error_msg = str(e).lower()
        if "already exists" in error_msg or "duplicate" in error_msg:
            raise HTTPException(status_code=400, detail="Email already exists")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {e}")
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
                profile_name = f"{profile['parent_first_name']} {profile['parent_last_name']}"
    except Exception as e:
        # If profile fetch fails, continue without name
        print(f"Warning: Could not fetch profile for user {current_user['id']}: {e}")
    
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        role=current_user["role"],
        is_active=current_user["is_active"],
        is_verified=current_user["is_verified"],
        created_at=str(current_user.get("created_at", "")),
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
                "created_at": str(profile.get("created_at", ""))
            })
        elif current_user["role"] == "parent":
            profile = get_parent_profile(current_user["id"])
            if not profile:
                raise HTTPException(status_code=404, detail="Parent profile not found")
            return ParentProfile(**{
                **profile,
                "created_at": str(profile.get("created_at", ""))
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
                "created_at": str(updated_profile.get("created_at", ""))
            })
        elif current_user["role"] == "parent":
            updated_profile = update_parent_profile(current_user["id"], **update_data)
            if not updated_profile:
                raise HTTPException(status_code=404, detail="Parent profile not found")
            return ParentProfile(**{
                **updated_profile,
                "created_at": str(updated_profile.get("created_at", ""))
            })
        else:
            raise HTTPException(status_code=400, detail="Invalid user role")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update profile")

@app.get("/api/test-auth")
async def test_auth(current_user: dict = Depends(get_current_user)):
    """
    Test endpoint to verify authentication is working
    """
    return {
        "message": "Authentication successful",
        "user": current_user
    }

@app.get("/api/students", response_model=List[StudentResponse])
async def get_all_students_route(current_user: dict = Depends(get_current_user)):
    """
    Get all students/children in the system
    Accessible by authenticated users
    """
    try:
        students = get_all_students()
        return [StudentResponse(**student) for student in students]
        
    except Exception as e:
        logger.error(f"Error fetching all students: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch students")

@app.get("/api/students/{student_id}", response_model=StudentResponse)
async def get_student_route(
    student_id: int, 
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific student by ID
    Only accessible by therapists
    """
    try:
        # Check if user is therapist
        if current_user["role"] != "therapist":
            raise HTTPException(
                status_code=403, 
                detail="Access denied. Only therapists can view student details."
            )
        
        student = get_student_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return StudentResponse(**student)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching student {student_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch student")

@app.get("/api/my-students", response_model=List[StudentResponse])
async def get_my_students_route(current_user: dict = Depends(get_current_user)):
    """
    Get students assigned to the current therapist
    Only accessible by therapists
    """
    try:
        # Check if user is therapist
        if current_user["role"] != "therapist":
            raise HTTPException(
                status_code=403, 
                detail="Access denied. Only therapists can view assigned students."
            )
        
        students = get_students_by_therapist(current_user["id"])
        return [StudentResponse(**student) for student in students]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching students for therapist {current_user['id']}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch assigned students")

@app.post("/api/enroll-student", response_model=StudentResponse)
async def enroll_student_route(
    student_data: StudentEnrollment,
    current_user: dict = Depends(get_current_user)
):
    """
    Enroll a new student
    """
    try:
        # Convert Pydantic model to dict
        student_dict = student_data.dict()
        
        # Enroll the student
        student = enroll_student(student_dict)
        return StudentResponse(**student)
        
    except Exception as e:
        logger.error(f"Error enrolling student: {e}")
        raise HTTPException(status_code=500, detail="Failed to enroll student")

# ==================== SESSION NOTES ENDPOINTS ====================

@app.get("/api/notes/{session_date}", response_model=List[SessionNoteResponse])
async def get_notes_by_date(session_date: date, current_user: dict = Depends(get_current_user)):
    """Get all session notes for the current therapist on a specific date"""
    try:
        therapist_id = current_user['id']
        notes = await get_notes_by_date_and_therapist(therapist_id, session_date)
        return notes
    except Exception as e:
        logger.error(f"Error fetching notes for date {session_date}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notes")

@app.post("/api/notes", response_model=SessionNoteResponse)
async def create_note(note_data: SessionNoteCreate, current_user: dict = Depends(get_current_user)):
    """Create a new session note"""
    try:
        therapist_id = current_user['id']
        note = await create_session_note(therapist_id, note_data)
        return note
    except Exception as e:
        logger.error(f"Error creating note: {e}")
        raise HTTPException(status_code=500, detail="Failed to create note")

@app.get("/api/notes/dates/all", response_model=List[str])
async def get_notes_dates(current_user: dict = Depends(get_current_user)):
    """Get all dates that have notes for the current therapist (for calendar highlighting)"""
    try:
        therapist_id = current_user['id']
        dates = await get_notes_with_dates_for_therapist(therapist_id)
        # Convert dates to strings for JSON serialization
        return [d.isoformat() for d in dates]
    except Exception as e:
        logger.error(f"Error fetching notes dates: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notes dates")

# ============ SESSIONS ENDPOINTS ============

@app.post("/api/sessions", response_model=SessionResponse)
async def create_session_endpoint(session_data: SessionCreate, current_user: dict = Depends(get_current_user)):
    """Create a new therapy session"""
    try:
        therapist_id = current_user['id']
        session = await create_session(therapist_id, session_data)
        return session
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")

@app.get("/api/sessions", response_model=List[SessionResponse])
async def get_sessions(limit: int = 50, offset: int = 0, current_user: dict = Depends(get_current_user)):
    """Get all sessions for the current therapist"""
    try:
        therapist_id = current_user['id']
        sessions = await get_sessions_by_therapist(therapist_id, limit, offset)
        return sessions
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sessions")

@app.get("/api/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific session by ID"""
    try:
        therapist_id = current_user['id']
        session = await get_session_by_id(session_id, therapist_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch session")

@app.put("/api/sessions/{session_id}", response_model=SessionResponse)
async def update_session_endpoint(session_id: int, session_data: SessionUpdate, current_user: dict = Depends(get_current_user)):
    """Update a session"""
    try:
        therapist_id = current_user['id']
        session = await update_session(session_id, therapist_id, session_data)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update session")

@app.delete("/api/sessions/{session_id}")
async def delete_session_endpoint(session_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a session"""
    try:
        therapist_id = current_user['id']
        success = await delete_session(session_id, therapist_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete session")

# ============ SESSION ACTIVITIES ENDPOINTS ============

@app.post("/api/sessions/{session_id}/activities", response_model=SessionActivityResponse)
async def add_activity_to_session_endpoint(session_id: int, activity_data: SessionActivityCreate, current_user: dict = Depends(get_current_user)):
    """Add an activity to a session"""
    try:
        therapist_id = current_user['id']
        activity = await add_activity_to_session(session_id, therapist_id, activity_data)
        return activity
    except Exception as e:
        logger.error(f"Error adding activity to session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to add activity to session")

@app.get("/api/sessions/{session_id}/activities", response_model=List[SessionActivityResponse])
async def get_session_activities_endpoint(session_id: int, current_user: dict = Depends(get_current_user)):
    """Get all activities for a session"""
    try:
        therapist_id = current_user['id']
        activities = await get_session_activities(session_id, therapist_id)
        return activities
    except Exception as e:
        logger.error(f"Error fetching activities for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch session activities")

@app.get("/api/students/{student_id}/activities", response_model=List[StudentActivityResponse])
async def get_student_activities_endpoint(student_id: int, current_user: dict = Depends(get_current_user)):
    """Get all available activities for a student"""
    try:
        activities = await get_available_student_activities(student_id)
        return activities
    except Exception as e:
        logger.error(f"Error fetching activities for student {student_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch student activities")

@app.delete("/api/sessions/{session_id}/activities/{activity_id}")
async def remove_activity_from_session_endpoint(session_id: int, activity_id: int, current_user: dict = Depends(get_current_user)):
    """Remove an activity from a session"""
    try:
        therapist_id = current_user['id']
        success = await remove_activity_from_session(activity_id, session_id, therapist_id)
        if not success:
            raise HTTPException(status_code=404, detail="Activity not found in session")
        return {"message": "Activity removed from session successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing activity {activity_id} from session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove activity from session")

# ==================== ROOT ENDPOINTS ====================

@app.get("/")
async def root():
    return {"message": "ThrivePath API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ThrivePath API"}

@app.get("/api/test-db")
async def test_database_connection():
    """Test Supabase database connection"""
    try:
        from db import test_connection
        success, message = test_connection()
        if success:
            return {"status": "success", "message": message, "database": "Supabase PostgreSQL"}
        else:
            raise HTTPException(status_code=500, detail=f"Database connection failed: {message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database test failed: {str(e)}")

@app.get("/api/test-supabase")
async def test_supabase_client():
    """Test Supabase client connection"""
    try:
        from db import test_supabase_client, init_supabase_client
        
        # Try to initialize client first
        client = init_supabase_client()
        if not client:
            return {
                "status": "warning", 
                "message": "Supabase client not available - please add SUPABASE_ANON_KEY to .env file",
                "client": "Not initialized"
            }
        
        success, message = test_supabase_client()
        if success:
            return {"status": "success", "message": message, "client": "Supabase Python Client"}
        else:
            return {"status": "error", "message": message, "client": "Supabase Python Client"}
    except Exception as e:
        return {"status": "error", "message": f"Supabase client test failed: {str(e)}"}

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