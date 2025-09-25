from typing import List, Optional, Dict, Any
from datetime import date, datetime, time
from pydantic import BaseModel, validator
import logging
from db import get_supabase_client

logger = logging.getLogger(__name__)

# Pydantic Models
class SessionCreate(BaseModel):
    student_id: int
    session_date: date
    start_time: time
    end_time: time
    session_type: str = 'therapy'
    estimated_duration_minutes: Optional[int] = None
    therapist_notes: Optional[str] = None

    @validator('end_time')
    def validate_end_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v

class SessionUpdate(BaseModel):
    session_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    session_type: Optional[str] = None
    status: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    actual_duration_minutes: Optional[int] = None
    prerequisite_completion_required: Optional[bool] = None
    therapist_notes: Optional[str] = None

class SessionResponse(BaseModel):
    id: int
    therapist_id: int
    student_id: int
    session_date: date
    start_time: time
    end_time: time
    session_type: str
    status: str
    total_planned_activities: int
    completed_activities: int
    estimated_duration_minutes: Optional[int]
    actual_duration_minutes: Optional[int]
    prerequisite_completion_required: bool
    therapist_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Related data
    student_name: Optional[str] = None
    therapist_name: Optional[str] = None

class SessionActivityCreate(BaseModel):
    student_activity_id: int
    estimated_duration: Optional[int] = None
    prerequisites: Optional[List[str]] = []

class SessionActivityUpdate(BaseModel):
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    prerequisites: Optional[List[str]] = None
    completed_prerequisites: Optional[List[str]] = None
    skipped_prerequisites: Optional[List[str]] = None
    status: Optional[str] = None

class SessionActivityResponse(BaseModel):
    id: int
    session_id: int
    student_activity_id: int
    estimated_duration: Optional[int]
    actual_duration: Optional[int]
    prerequisites: List[str]
    completed_prerequisites: List[str]
    skipped_prerequisites: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
    
    # Related activity data
    activity_name: Optional[str] = None
    activity_description: Optional[str] = None
    difficulty_level: Optional[int] = None

class StudentActivityResponse(BaseModel):
    id: int
    student_id: int
    activity_name: str
    activity_description: Optional[str]
    difficulty_level: int
    estimated_duration: int
    current_status: str
    total_attempts: int
    successful_attempts: int
    last_attempted: Optional[date]
    created_at: datetime
    updated_at: datetime

# Database Functions
async def create_session(therapist_id: int, session_data: SessionCreate) -> SessionResponse:
    """Create a new therapy session"""
    try:
        supabase = get_supabase_client()
        
        # Calculate estimated duration if not provided
        estimated_duration = session_data.estimated_duration_minutes
        if not estimated_duration:
            start_datetime = datetime.combine(date.today(), session_data.start_time)
            end_datetime = datetime.combine(date.today(), session_data.end_time)
            estimated_duration = int((end_datetime - start_datetime).total_seconds() / 60)
        
        insert_data = {
            'therapist_id': therapist_id,
            'student_id': session_data.student_id,
            'session_date': session_data.session_date.isoformat(),
            'start_time': session_data.start_time.isoformat(),
            'end_time': session_data.end_time.isoformat(),
            'session_type': session_data.session_type,
            'estimated_duration_minutes': estimated_duration,
            'therapist_notes': session_data.therapist_notes,
            'status': 'scheduled',
            'total_planned_activities': 0,
            'completed_activities': 0,
            'prerequisite_completion_required': False,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        result = supabase.table('sessions').insert(insert_data).execute()
        
        if not result.data:
            raise Exception("Failed to create session")
        
        session_data = result.data[0]
        
        # Fetch related data
        student_result = supabase.table('children').select('first_name, last_name').eq('id', session_data['student_id']).execute()
        therapist_result = supabase.table('therapists').select('first_name, last_name').eq('user_id', therapist_id).execute()
        
        student_name = None
        therapist_name = None
        
        if student_result.data:
            student = student_result.data[0]
            student_name = f"{student['first_name']} {student['last_name']}"
        
        if therapist_result.data:
            therapist = therapist_result.data[0]
            therapist_name = f"{therapist['first_name']} {therapist['last_name']}"
        
        session_response = SessionResponse(
            id=session_data['id'],
            therapist_id=session_data['therapist_id'],
            student_id=session_data['student_id'],
            session_date=session_data['session_date'],
            start_time=session_data['start_time'],
            end_time=session_data['end_time'],
            session_type=session_data['session_type'],
            status=session_data['status'],
            total_planned_activities=session_data['total_planned_activities'],
            completed_activities=session_data['completed_activities'],
            estimated_duration_minutes=session_data['estimated_duration_minutes'],
            actual_duration_minutes=session_data['actual_duration_minutes'],
            prerequisite_completion_required=session_data['prerequisite_completion_required'],
            therapist_notes=session_data['therapist_notes'],
            created_at=session_data['created_at'],
            updated_at=session_data['updated_at'],
            student_name=student_name,
            therapist_name=therapist_name
        )
        
        logger.info(f"Created session {session_response.id} for therapist {therapist_id}")
        return session_response
        
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def get_sessions_by_therapist(therapist_id: int, limit: int = 50, offset: int = 0) -> List[SessionResponse]:
    """Get all sessions for a specific therapist"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('sessions').select('''
            id, therapist_id, student_id, session_date, start_time, end_time,
            session_type, status, total_planned_activities, completed_activities,
            estimated_duration_minutes, actual_duration_minutes, 
            prerequisite_completion_required, therapist_notes, created_at, updated_at,
            children!student_id (first_name, last_name)
        ''').eq('therapist_id', therapist_id).order('session_date', desc=True).range(offset, offset + limit - 1).execute()
        
        if not result.data:
            return []
        
        sessions = []
        for session_data in result.data:
            student_name = None
            if session_data.get('children'):
                student = session_data['children']
                student_name = f"{student['first_name']} {student['last_name']}"
            
            session = SessionResponse(
                id=session_data['id'],
                therapist_id=session_data['therapist_id'],
                student_id=session_data['student_id'],
                session_date=session_data['session_date'],
                start_time=session_data['start_time'],
                end_time=session_data['end_time'],
                session_type=session_data['session_type'],
                status=session_data['status'],
                total_planned_activities=session_data['total_planned_activities'],
                completed_activities=session_data['completed_activities'],
                estimated_duration_minutes=session_data['estimated_duration_minutes'],
                actual_duration_minutes=session_data['actual_duration_minutes'],
                prerequisite_completion_required=session_data['prerequisite_completion_required'],
                therapist_notes=session_data['therapist_notes'],
                created_at=session_data['created_at'],
                updated_at=session_data['updated_at'],
                student_name=student_name
            )
            sessions.append(session)
        
        logger.info(f"Retrieved {len(sessions)} sessions for therapist {therapist_id}")
        return sessions
        
    except Exception as e:
        logger.error(f"Error getting sessions for therapist: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def get_session_by_id(session_id: int, therapist_id: int) -> Optional[SessionResponse]:
    """Get a specific session by ID"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('sessions').select('''
            id, therapist_id, student_id, session_date, start_time, end_time,
            session_type, status, total_planned_activities, completed_activities,
            estimated_duration_minutes, actual_duration_minutes, 
            prerequisite_completion_required, therapist_notes, created_at, updated_at,
            children!student_id (first_name, last_name)
        ''').eq('id', session_id).eq('therapist_id', therapist_id).execute()
        
        if not result.data:
            return None
        
        session_data = result.data[0]
        
        student_name = None
        if session_data.get('children'):
            student = session_data['children']
            student_name = f"{student['first_name']} {student['last_name']}"
        
        session = SessionResponse(
            id=session_data['id'],
            therapist_id=session_data['therapist_id'],
            student_id=session_data['student_id'],
            session_date=session_data['session_date'],
            start_time=session_data['start_time'],
            end_time=session_data['end_time'],
            session_type=session_data['session_type'],
            status=session_data['status'],
            total_planned_activities=session_data['total_planned_activities'],
            completed_activities=session_data['completed_activities'],
            estimated_duration_minutes=session_data['estimated_duration_minutes'],
            actual_duration_minutes=session_data['actual_duration_minutes'],
            prerequisite_completion_required=session_data['prerequisite_completion_required'],
            therapist_notes=session_data['therapist_notes'],
            created_at=session_data['created_at'],
            updated_at=session_data['updated_at'],
            student_name=student_name
        )
        
        logger.info(f"Retrieved session {session_id}")
        return session
        
    except Exception as e:
        logger.error(f"Error getting session {session_id}: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def update_session(session_id: int, therapist_id: int, session_data: SessionUpdate) -> Optional[SessionResponse]:
    """Update a session"""
    try:
        supabase = get_supabase_client()
        
        # Build update data
        update_data = {'updated_at': datetime.now().isoformat()}
        
        if session_data.session_date is not None:
            update_data['session_date'] = session_data.session_date.isoformat()
        if session_data.start_time is not None:
            update_data['start_time'] = session_data.start_time.isoformat()
        if session_data.end_time is not None:
            update_data['end_time'] = session_data.end_time.isoformat()
        if session_data.session_type is not None:
            update_data['session_type'] = session_data.session_type
        if session_data.status is not None:
            update_data['status'] = session_data.status
        if session_data.estimated_duration_minutes is not None:
            update_data['estimated_duration_minutes'] = session_data.estimated_duration_minutes
        if session_data.actual_duration_minutes is not None:
            update_data['actual_duration_minutes'] = session_data.actual_duration_minutes
        if session_data.prerequisite_completion_required is not None:
            update_data['prerequisite_completion_required'] = session_data.prerequisite_completion_required
        if session_data.therapist_notes is not None:
            update_data['therapist_notes'] = session_data.therapist_notes
        
        result = supabase.table('sessions').update(update_data).eq('id', session_id).eq('therapist_id', therapist_id).execute()
        
        if not result.data:
            return None
        
        # Return updated session
        return await get_session_by_id(session_id, therapist_id)
        
    except Exception as e:
        logger.error(f"Error updating session {session_id}: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def delete_session(session_id: int, therapist_id: int) -> bool:
    """Delete a session"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('sessions').delete().eq('id', session_id).eq('therapist_id', therapist_id).execute()
        
        return len(result.data) > 0
        
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

# Session Activities Functions
async def add_activity_to_session(session_id: int, therapist_id: int, activity_data: SessionActivityCreate) -> SessionActivityResponse:
    """Add an activity to a session"""
    try:
        supabase = get_supabase_client()
        
        # Verify session belongs to therapist
        session_check = supabase.table('sessions').select('id').eq('id', session_id).eq('therapist_id', therapist_id).execute()
        if not session_check.data:
            raise Exception("Session not found or access denied")
        
        insert_data = {
            'session_id': session_id,
            'student_activity_id': activity_data.student_activity_id,
            'estimated_duration': activity_data.estimated_duration,
            'prerequisites': activity_data.prerequisites or [],
            'completed_prerequisites': [],
            'skipped_prerequisites': [],
            'status': 'planned',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        result = supabase.table('session_activities').insert(insert_data).execute()
        
        if not result.data:
            raise Exception("Failed to add activity to session")
        
        activity_data = result.data[0]
        
        # Update session total planned activities
        supabase.table('sessions').update({
            'total_planned_activities': supabase.table('sessions').select('total_planned_activities').eq('id', session_id).execute().data[0]['total_planned_activities'] + 1,
            'updated_at': datetime.now().isoformat()
        }).eq('id', session_id).execute()
        
        # Get activity details
        activity_result = supabase.table('student_activities').select('activity_name, activity_description, difficulty_level').eq('id', activity_data['student_activity_id']).execute()
        
        activity_name = None
        activity_description = None
        difficulty_level = None
        
        if activity_result.data:
            activity = activity_result.data[0]
            activity_name = activity['activity_name']
            activity_description = activity['activity_description']
            difficulty_level = activity['difficulty_level']
        
        session_activity = SessionActivityResponse(
            id=activity_data['id'],
            session_id=activity_data['session_id'],
            student_activity_id=activity_data['student_activity_id'],
            estimated_duration=activity_data['estimated_duration'],
            actual_duration=activity_data['actual_duration'],
            prerequisites=activity_data['prerequisites'],
            completed_prerequisites=activity_data['completed_prerequisites'],
            skipped_prerequisites=activity_data['skipped_prerequisites'],
            status=activity_data['status'],
            created_at=activity_data['created_at'],
            updated_at=activity_data['updated_at'],
            activity_name=activity_name,
            activity_description=activity_description,
            difficulty_level=difficulty_level
        )
        
        logger.info(f"Added activity {activity_data['student_activity_id']} to session {session_id}")
        return session_activity
        
    except Exception as e:
        logger.error(f"Error adding activity to session: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def get_session_activities(session_id: int, therapist_id: int) -> List[SessionActivityResponse]:
    """Get all activities for a session"""
    try:
        supabase = get_supabase_client()
        
        # Verify session belongs to therapist
        session_check = supabase.table('sessions').select('id').eq('id', session_id).eq('therapist_id', therapist_id).execute()
        if not session_check.data:
            raise Exception("Session not found or access denied")
        
        result = supabase.table('session_activities').select('''
            id, session_id, student_activity_id, estimated_duration, actual_duration,
            prerequisites, completed_prerequisites, skipped_prerequisites, status,
            created_at, updated_at,
            student_activities!student_activity_id (activity_name, activity_description, difficulty_level)
        ''').eq('session_id', session_id).order('created_at').execute()
        
        if not result.data:
            return []
        
        activities = []
        for activity_data in result.data:
            activity_info = activity_data.get('student_activities')
            
            activity = SessionActivityResponse(
                id=activity_data['id'],
                session_id=activity_data['session_id'],
                student_activity_id=activity_data['student_activity_id'],
                estimated_duration=activity_data['estimated_duration'],
                actual_duration=activity_data['actual_duration'],
                prerequisites=activity_data['prerequisites'] or [],
                completed_prerequisites=activity_data['completed_prerequisites'] or [],
                skipped_prerequisites=activity_data['skipped_prerequisites'] or [],
                status=activity_data['status'],
                created_at=activity_data['created_at'],
                updated_at=activity_data['updated_at'],
                activity_name=activity_info['activity_name'] if activity_info else None,
                activity_description=activity_info['activity_description'] if activity_info else None,
                difficulty_level=activity_info['difficulty_level'] if activity_info else None
            )
            activities.append(activity)
        
        logger.info(f"Retrieved {len(activities)} activities for session {session_id}")
        return activities
        
    except Exception as e:
        logger.error(f"Error getting session activities: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def get_available_student_activities(student_id: int) -> List[StudentActivityResponse]:
    """Get all available activities for a student"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('student_activities').select('*').eq('student_id', student_id).order('activity_name').execute()
        
        if not result.data:
            return []
        
        activities = []
        for activity_data in result.data:
            activity = StudentActivityResponse(
                id=activity_data['id'],
                student_id=activity_data['student_id'],
                activity_name=activity_data['activity_name'],
                activity_description=activity_data['activity_description'],
                difficulty_level=activity_data['difficulty_level'],
                estimated_duration=activity_data['estimated_duration'],
                current_status=activity_data['current_status'],
                total_attempts=activity_data['total_attempts'],
                successful_attempts=activity_data['successful_attempts'],
                last_attempted=activity_data['last_attempted'],
                created_at=activity_data['created_at'],
                updated_at=activity_data['updated_at']
            )
            activities.append(activity)
        
        logger.info(f"Retrieved {len(activities)} available activities for student {student_id}")
        return activities
        
    except Exception as e:
        logger.error(f"Error getting student activities: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def remove_activity_from_session(session_activity_id: int, session_id: int, therapist_id: int) -> bool:
    """Remove an activity from a session"""
    try:
        supabase = get_supabase_client()
        
        # Verify session belongs to therapist
        session_check = supabase.table('sessions').select('id').eq('id', session_id).eq('therapist_id', therapist_id).execute()
        if not session_check.data:
            raise Exception("Session not found or access denied")
        
        result = supabase.table('session_activities').delete().eq('id', session_activity_id).eq('session_id', session_id).execute()
        
        if result.data:
            # Update session total planned activities
            current_session = supabase.table('sessions').select('total_planned_activities').eq('id', session_id).execute()
            if current_session.data:
                new_count = max(0, current_session.data[0]['total_planned_activities'] - 1)
                supabase.table('sessions').update({
                    'total_planned_activities': new_count,
                    'updated_at': datetime.now().isoformat()
                }).eq('id', session_id).execute()
        
        return len(result.data) > 0
        
    except Exception as e:
        logger.error(f"Error removing activity from session: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def get_completed_sessions_by_child_id(child_id: int, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Get all completed sessions for a specific child
    """
    try:
        logger.info(f"Fetching completed sessions for child_id: {child_id}, limit: {limit}, offset: {offset}")
        supabase = get_supabase_client()
        
        # Query sessions where child_id matches child_id and status is 'completed'
        result = supabase.table('sessions').select(
            '*'
        ).eq('child_id', child_id).eq('status', 'completed').order('session_date', desc=True).limit(limit).range(offset, offset + limit - 1).execute()
        
        # Return the raw data with some field mapping for frontend compatibility
        sessions = []
        for session_data in result.data:
            try:
                # Map database fields to frontend expected fields
                mapped_session = {
                    'id': session_data['id'],
                    'therapist_id': session_data['therapist_id'],
                    'student_id': session_data['child_id'],  # Map child_id to student_id for frontend compatibility
                    'session_date': session_data['session_date'],
                    'start_time': session_data['start_time'],
                    'end_time': session_data['end_time'],
                    'session_type': session_data.get('session_type', 'therapy'),
                    'status': session_data['status'],
                    'total_planned_activities': session_data.get('total_planned_activities', 0),
                    'completed_activities': session_data.get('completed_activities', 0),
                    'estimated_duration_minutes': session_data.get('estimated_duration_minutes'),
                    'actual_duration_minutes': session_data.get('actual_duration_minutes'),
                    'prerequisite_completion_required': session_data.get('prerequisite_completion_required', False),
                    'therapist_notes': session_data.get('therapist_notes'),
                    'parent_feedback': session_data.get('parent_feedback'),
                    'created_at': session_data['created_at'],
                    'updated_at': session_data['updated_at'],
                    'student_name': None,
                    'therapist_name': None
                }
                
                sessions.append(mapped_session)
            except Exception as parse_error:
                logger.error(f"Error parsing session data: {parse_error}")
                continue
        
        logger.info(f"Found {len(sessions)} completed sessions for child_id: {child_id}")
        return sessions
        
    except Exception as e:
        logger.error(f"Error fetching completed sessions by child_id: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

# Feedback-related models and functions
class SessionFeedbackCreate(BaseModel):
    session_id: int
    feedback: str

async def update_session_parent_feedback(session_id: int, parent_feedback: str) -> bool:
    """Update parent feedback for a specific session"""
    try:
        supabase = get_supabase_client()
        
        # Update the session with parent feedback
        result = supabase.table('sessions').update({
            'parent_feedback': parent_feedback,
            'updated_at': datetime.now().isoformat()
        }).eq('id', session_id).execute()
        
        if result.data:
            logger.info(f"Successfully updated parent feedback for session {session_id}")
            return True
        else:
            logger.error(f"No session found with ID {session_id}")
            return False
            
    except Exception as e:
        logger.error(f"Error updating parent feedback for session {session_id}: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def get_session_for_parent_verification(session_id: int) -> Optional[Dict[str, Any]]:
    """Get session data for parent verification (without therapist restriction)"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('sessions').select(
            'id, child_id, session_date, status'
        ).eq('id', session_id).execute()
        
        if not result.data:
            return None
            
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error fetching session for parent verification {session_id}: {str(e)}")
        raise Exception(f"Database error: {str(e)}")
