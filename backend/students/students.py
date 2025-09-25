import logging
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from db import get_supabase_client, format_supabase_response, handle_supabase_error

logger = logging.getLogger(__name__)

def verify_child_in_database(child_first_name: str, child_last_name: str, child_dob: str) -> Optional[int]:
    """
    Verify child details against the children table and return child_id if found
    """
    try:
        client = get_supabase_client()
        
        # Query children table with exact match on name and DOB
        response = client.table('children').select('id').match({
            'first_name': child_first_name.strip(),
            'last_name': child_last_name.strip(), 
            'date_of_birth': child_dob
        }).execute()
        
        handle_supabase_error(response)
        children = format_supabase_response(response)
        
        if children and len(children) > 0:
            return children[0]['id']
        
        return None
        
    except Exception as e:
        logger.error(f"Error verifying child in database: {e}")
        return None

def get_student_by_id(child_id: int) -> Optional[Dict[str, Any]]:
    """
    Get child/student details by ID from children table
    """
    try:
        client = get_supabase_client()
        
        # Query children table with therapist information
        response = client.table('children').select(
            """
            id,
            first_name,
            last_name,
            date_of_birth,
            enrollment_date,
            diagnosis,
            status,
            primary_therapist_id,
            profile_details,
            therapists!primary_therapist_id (
                id,
                first_name,
                last_name
            )
            """
        ).eq('id', child_id).execute()
        
        handle_supabase_error(response)
        children = format_supabase_response(response)
        
        if not children or len(children) == 0:
            return None
        
        child = children[0]
        
        # Calculate age from date_of_birth
        age = None
        if child.get('date_of_birth'):
            birth_date = datetime.strptime(child['date_of_birth'], '%Y-%m-%d').date()
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        # Get therapist info
        therapist = child.get('therapists')
        therapist_name = None
        if therapist:
            therapist_name = f"{therapist.get('first_name', '')} {therapist.get('last_name', '')}".strip()
        
        # Transform data to match expected format
        return {
            "id": child['id'],
            "name": f"{child.get('first_name', '')} {child.get('last_name', '')}".strip(),
            "first_name": child.get('first_name'),
            "last_name": child.get('last_name'),
            "age": age,
            "date_of_birth": child.get('date_of_birth'),
            "enrollment_date": child.get('enrollment_date'),
            "diagnosis": child.get('diagnosis'),
            "status": child.get('status'),
            "primary_therapist": therapist_name,
            "primary_therapist_id": child.get('primary_therapist_id'),
            "profile_details": child.get('profile_details', {}),
            # Add some default values for dashboard compatibility
            "progressPercentage": 75,
            "achievements": [],
            "goals": ["Communication improvement", "Social skills development"],
            "nextSession": None
        }
        
    except Exception as e:
        logger.error(f"Error getting student by ID {child_id}: {e}")
        return None

def get_all_students() -> List[Dict[str, Any]]:
    """
    Fetch all students from the children table
    """
    try:
        client = get_supabase_client()
        # Query the children table with therapist information
        response = client.table('children').select(
            """
            id,
            first_name,
            last_name,
            date_of_birth,
            enrollment_date,
            diagnosis,
            status,
            primary_therapist_id,
            profile_details,
            therapists!primary_therapist_id (
                id,
                first_name,
                last_name
            )
            """
        ).execute()
        
        handle_supabase_error(response)
        students = format_supabase_response(response)
        
        if not students:
            return []
        
        # Transform data to match frontend expectations
        transformed_students = []
        for student in students:
            # Calculate age from date_of_birth
            if student.get('date_of_birth'):
                birth_date = datetime.strptime(student['date_of_birth'], '%Y-%m-%d').date()
                today = date.today()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            else:
                age = None
            
            # Extract profile details
            profile_details = student.get('profile_details', {})
            
            # Format therapist information
            therapist_info = student.get('therapists')
            primary_therapist = None
            if therapist_info:
                primary_therapist = f"{therapist_info['first_name']} {therapist_info['last_name']}"
            
            # Transform to frontend format
            transformed_student = {
                'id': student['id'],
                'name': f"{student['first_name']} {student['last_name']}",
                'firstName': student['first_name'],
                'lastName': student['last_name'],
                'age': age,
                'dateOfBirth': student['date_of_birth'],
                'enrollmentDate': student['enrollment_date'],
                'diagnosis': student.get('diagnosis'),
                'status': student.get('status', 'active'),
                'primaryTherapist': primary_therapist,
                'primaryTherapistId': student.get('primary_therapist_id'),
                'profileDetails': profile_details,
                
                # Add mock data for compatibility with frontend (can be replaced with real data later)
                'photo': profile_details.get('photo_url'),
                'progressPercentage': profile_details.get('progress_percentage', 75),
                'nextSession': profile_details.get('next_session'),
                'goals': profile_details.get('goals', [
                    'Improve communication skills',
                    'Develop social interaction',
                    'Enhance cognitive abilities'
                ])
            }
            
            transformed_students.append(transformed_student)
        
        logger.info(f"Successfully fetched {len(transformed_students)} students")
        return transformed_students
        
    except Exception as e:
        logger.error(f"Error fetching students: {e}")
        raise Exception(f"Failed to fetch students: {str(e)}")

def get_student_by_id(student_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetch a specific student by ID
    """
    try:
        client = get_supabase_client()
        
        response = client.table('children').select(
            """
            id,
            first_name,
            last_name,
            date_of_birth,
            enrollment_date,
            diagnosis,
            status,
            primary_therapist_id,
            profile_details,
            therapists!primary_therapist_id (
                id,
                first_name,
                last_name,
                email
            )
            """
        ).eq('id', student_id).execute()
        
        handle_supabase_error(response)
        students = format_supabase_response(response)
        
        if not students:
            return None
        
        student = students[0]
        
        # Calculate age
        if student.get('date_of_birth'):
            birth_date = datetime.strptime(student['date_of_birth'], '%Y-%m-%d').date()
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        else:
            age = None
        
        # Extract profile details
        profile_details = student.get('profile_details', {})
        
        # Format therapist information
        therapist_info = student.get('therapists')
        primary_therapist = None
        if therapist_info:
            primary_therapist = f"{therapist_info['first_name']} {therapist_info['last_name']}"
        
        # Transform to frontend format
        transformed_student = {
            'id': student['id'],
            'name': f"{student['first_name']} {student['last_name']}",
            'firstName': student['first_name'],
            'lastName': student['last_name'],
            'age': age,
            'dateOfBirth': student['date_of_birth'],
            'enrollmentDate': student['enrollment_date'],
            'diagnosis': student.get('diagnosis'),
            'status': student.get('status', 'active'),
            'primaryTherapist': primary_therapist,
            'primaryTherapistId': student.get('primary_therapist_id'),
            'profileDetails': profile_details,
            'photo': profile_details.get('photo_url'),
            'progressPercentage': profile_details.get('progress_percentage', 75),
            'nextSession': profile_details.get('next_session'),
            'goals': profile_details.get('goals', [
                'Improve communication skills',
                'Develop social interaction',
                'Enhanced cognitive abilities'
            ])
        }
        
        logger.info(f"Successfully fetched student {student_id}")
        return transformed_student
        
    except Exception as e:
        logger.error(f"Error fetching student {student_id}: {e}")
        raise Exception(f"Failed to fetch student: {str(e)}")

def get_students_by_therapist(therapist_id: int) -> List[Dict[str, Any]]:
    """
    Fetch all students assigned to a specific therapist
    """
    try:
        client = get_supabase_client()
        
        response = client.table('children').select(
            """
            id,
            first_name,
            last_name,
            date_of_birth,
            enrollment_date,
            diagnosis,
            status,
            primary_therapist_id,
            profile_details
            """
        ).eq('primary_therapist_id', therapist_id).execute()
        
        handle_supabase_error(response)
        students = format_supabase_response(response)
        
        if not students:
            return []
        
        # Transform data similar to get_all_students
        transformed_students = []
        for student in students:
            # Calculate age
            if student.get('date_of_birth'):
                birth_date = datetime.strptime(student['date_of_birth'], '%Y-%m-%d').date()
                today = date.today()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            else:
                age = None
            
            profile_details = student.get('profile_details', {})
            
            transformed_student = {
                'id': student['id'],
                'name': f"{student['first_name']} {student['last_name']}",
                'firstName': student['first_name'],
                'lastName': student['last_name'],
                'age': age,
                'dateOfBirth': student['date_of_birth'],
                'enrollmentDate': student['enrollment_date'],
                'diagnosis': student.get('diagnosis'),
                'status': student.get('status', 'active'),
                'primaryTherapistId': student.get('primary_therapist_id'),
                'profileDetails': profile_details,
                'photo': profile_details.get('photo_url'),
                'progressPercentage': profile_details.get('progress_percentage', 75),
                'nextSession': profile_details.get('next_session'),
                'goals': profile_details.get('goals', [
                    'Improve communication skills',
                    'Develop social interaction',
                    'Enhanced cognitive abilities'
                ])
            }
            
            transformed_students.append(transformed_student)
        
        logger.info(f"Successfully fetched {len(transformed_students)} students for therapist {therapist_id}")
        return transformed_students
        
    except Exception as e:
        logger.error(f"Error fetching students for therapist {therapist_id}: {e}")
        raise Exception(f"Failed to fetch students for therapist: {str(e)}")

def enroll_student(student_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enroll a new student in the children table
    """
    try:
        client = get_supabase_client()
        
        # Insert new student
        response = client.table('children').insert({
            'first_name': student_data['firstName'],
            'last_name': student_data['lastName'], 
            'date_of_birth': student_data['dateOfBirth'],
            'enrollment_date': datetime.now().date().isoformat(),
            'diagnosis': student_data.get('diagnosis'),
            'status': 'active',
            'primary_therapist_id': student_data['therapistId'],
            'profile_details': {
                'age': student_data.get('age'),
                'goals': student_data.get('goals', []),
                'progress_percentage': 0
            }
        }).execute()
        
        handle_supabase_error(response)
        students = format_supabase_response(response)
        
        if not students:
            raise Exception("Failed to create student")
        
        student = students[0]
        
        # Calculate age if date of birth provided
        age = None
        if student.get('date_of_birth'):
            birth_date = datetime.strptime(student['date_of_birth'], '%Y-%m-%d').date()
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        # Transform to frontend format
        transformed_student = {
            'id': student['id'],
            'name': f"{student['first_name']} {student['last_name']}",
            'firstName': student['first_name'],
            'lastName': student['last_name'],
            'age': age,
            'dateOfBirth': student['date_of_birth'],
            'enrollmentDate': student['enrollment_date'],
            'diagnosis': student.get('diagnosis'),
            'status': student.get('status', 'active'),
            'primaryTherapistId': student.get('primary_therapist_id'),
            'profileDetails': student.get('profile_details', {}),
            'photo': student.get('profile_details', {}).get('photo_url'),
            'progressPercentage': 0,
            'goals': student_data.get('goals', [])
        }
        
        logger.info(f"Successfully enrolled student {student['id']}")
        return transformed_student
        
    except Exception as e:
        logger.error(f"Error enrolling student: {e}")
        raise Exception(f"Failed to enroll student: {str(e)}")
