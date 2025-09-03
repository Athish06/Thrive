from typing import List, Optional
from datetime import date, datetime, time
from pydantic import BaseModel
import logging
from db import get_supabase_client

logger = logging.getLogger(__name__)

class SessionNoteCreate(BaseModel):
    session_date: date
    note_content: str
    note_title: Optional[str] = None
    session_time: Optional[time] = None

class SessionNoteResponse(BaseModel):
    notes_id: int
    therapist_id: int
    session_date: date
    note_content: str
    note_title: Optional[str]
    session_time: Optional[time]
    created_at: datetime
    last_edited_at: datetime

async def get_notes_by_date_and_therapist(therapist_id: int, session_date: date) -> List[SessionNoteResponse]:
    """Get all notes for a specific therapist on a specific date"""
    try:
        supabase = get_supabase_client()
        
        # Query session_notes for the specific therapist and date
        query = supabase.table('session_notes').select('''
            notes_id,
            therapist_id,
            session_date,
            note_content,
            note_title,
            session_time,
            created_at,
            last_edited_at
        ''').eq('therapist_id', therapist_id).eq('session_date', session_date.isoformat()).order('created_at', desc=True)
        
        result = query.execute()
        
        if not result.data:
            logger.info(f"No notes found for therapist {therapist_id} on date {session_date}")
            return []
        
        notes = []
        for note_data in result.data:
            note = SessionNoteResponse(
                notes_id=note_data['notes_id'],
                therapist_id=note_data['therapist_id'],
                session_date=note_data['session_date'],
                note_content=note_data['note_content'],
                note_title=note_data.get('note_title'),
                session_time=note_data.get('session_time'),
                created_at=note_data['created_at'],
                last_edited_at=note_data['last_edited_at']
            )
            notes.append(note)
        
        logger.info(f"Retrieved {len(notes)} notes for therapist {therapist_id} on date {session_date}")
        return notes
        
    except Exception as e:
        logger.error(f"Error getting notes by date and therapist: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def create_session_note(therapist_id: int, note_data: SessionNoteCreate) -> SessionNoteResponse:
    """Create a new session note"""
    try:
        supabase = get_supabase_client()
        
        # Prepare the data for insertion
        insert_data = {
            'therapist_id': therapist_id,
            'session_date': note_data.session_date.isoformat(),
            'note_content': note_data.note_content,
            'note_title': note_data.note_title,
            'session_time': note_data.session_time.isoformat() if note_data.session_time else None,
            'created_at': datetime.now().isoformat(),
            'last_edited_at': datetime.now().isoformat()
        }
        
        result = supabase.table('session_notes').insert(insert_data).execute()
        
        if not result.data:
            raise Exception("Failed to create session note")
        
        note_data = result.data[0]
        
        created_note = SessionNoteResponse(
            notes_id=note_data['notes_id'],
            therapist_id=note_data['therapist_id'],
            session_date=note_data['session_date'],
            note_content=note_data['note_content'],
            note_title=note_data.get('note_title'),
            session_time=note_data.get('session_time'),
            created_at=note_data['created_at'],
            last_edited_at=note_data['last_edited_at']
        )
        
        logger.info(f"Created new session note with ID: {created_note.notes_id}")
        return created_note
        
    except Exception as e:
        logger.error(f"Error creating session note: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

async def get_notes_with_dates_for_therapist(therapist_id: int) -> List[date]:
    """Get all dates that have notes for a specific therapist (for calendar highlighting)"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('session_notes').select('session_date').eq('therapist_id', therapist_id).execute()
        
        if not result.data:
            return []
        
        # Extract unique dates
        dates = list(set([datetime.fromisoformat(note['session_date']).date() for note in result.data]))
        dates.sort()
        
        logger.info(f"Found notes on {len(dates)} different dates for therapist {therapist_id}")
        return dates
        
    except Exception as e:
        logger.error(f"Error getting notes dates for therapist: {str(e)}")
        raise Exception(f"Database error: {str(e)}")
