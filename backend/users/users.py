import bcrypt
# from db import get_db_connection
# import psycopg2
# from psycopg2 import sql
from db import get_supabase_client, format_supabase_response, handle_supabase_error
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def create_user(email: str, password: str, role: str, first_name: str = None, last_name: str = None, 
                phone: str = None, address: str = None, emergency_contact: str = None,
                # Additional parent fields
                parent_first_name: str = None, parent_last_name: str = None,
                child_first_name: str = None, child_last_name: str = None,
                child_dob: str = None, relation_to_child: str = None,
                alternate_phone: str = None, address_line1: str = None,
                address_line2: str = None, city: str = None, state: str = None,
                postal_code: str = None, country: str = None) -> dict:
    """
    Create a new user in the database and corresponding therapist/parent record using Supabase.
    Returns the created user dict (without password hash).
    Raises Exception if email already exists or other errors occur.
    """
    if role not in ("therapist", "parent"):
        raise ValueError("Invalid role. Must be 'therapist' or 'parent'")
    
    # Ensure we have required fields
    if not first_name:
        first_name = ""
    if not last_name:
        last_name = ""
    
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    client = get_supabase_client()
    
    try:
        # Create user record using Supabase
        user_data = {
            'email': email,
            'password_hash': password_hash,
            'role': role,
            'is_active': True,
            'is_verified': False
        }
        
        response = client.table('users').insert(user_data).execute()
        handle_supabase_error(response)
        
        users = format_supabase_response(response)
        if not users:
            raise Exception("Failed to create user")
            
        user = users[0]
        user_id = user["id"]
        logger.info(f"Created user with ID: {user_id}, email: {email}, role: {role}")
        
        # Create corresponding therapist or parent record
        if role == "therapist":
            profile_data = {
                'user_id': user_id,
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'phone': phone,
                'bio': '',
                'is_active': True
            }
            
            profile_response = client.table('therapists').insert(profile_data).execute()
            handle_supabase_error(profile_response)
            
            profiles = format_supabase_response(profile_response)
            if profiles:
                user["profile"] = profiles[0]
                logger.info(f"Created therapist profile with ID: {profiles[0]['id']}")
                
        elif role == "parent":
            # Use the new parent fields if provided, otherwise fall back to basic fields
            parent_fname = parent_first_name or first_name or ""
            parent_lname = parent_last_name or last_name or ""
            
            profile_data = {
                'user_id': user_id,
                'parent_first_name': parent_fname,
                'parent_last_name': parent_lname,
                'child_first_name': child_first_name or "",
                'child_last_name': child_last_name or "",
                'child_dob': child_dob,
                'email': email,
                'phone': phone,
                'alternate_phone': alternate_phone,
                'address_line1': address_line1 or "",
                'address_line2': address_line2 or "",
                'city': city or "",
                'state': state or "",
                'postal_code': postal_code or "",
                'country': country or 'India',
                'relation_to_child': relation_to_child or "",
                'is_verified': False
            }
            
            profile_response = client.table('parents').insert(profile_data).execute()
            handle_supabase_error(profile_response)
            
            profiles = format_supabase_response(profile_response)
            if profiles:
                user["profile"] = profiles[0]
                logger.info(f"Created parent profile with ID: {profiles[0]['id']}")
        
        return user
        
    except Exception as e:
        error_msg = str(e).lower()
        if 'unique' in error_msg or 'duplicate' in error_msg:
            logger.error(f"Email already exists: {email}")
            raise ValueError("Email already exists")
        logger.error(f"Error creating user {email}: {e}")
        raise Exception(f"Failed to create user: {e}")

# COMMENTED OUT: Direct PostgreSQL version (keeping for reference)
# def create_user(email: str, password: str, role: str, first_name: str = None, last_name: str = None, 
#                 phone: str = None, address: str = None, emergency_contact: str = None) -> dict:
#     """
#     Create a new user in the database and corresponding therapist/parent record.
#     Returns the created user dict (without password hash).
#     Raises psycopg2.IntegrityError if email already exists.
#     Updated for Supabase compatibility.
#     """
#     if role not in ("therapist", "parent"):
#         raise ValueError("Invalid role. Must be 'therapist' or 'parent'")
#     
#     # Ensure we have required fields
#     if not first_name:
#         first_name = ""
#     if not last_name:
#         last_name = ""
#     
#     password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
#     conn = get_db_connection()
#     
#     try:
#         with conn:
#             with conn.cursor() as cur:
#                 # Create user record
#                 cur.execute(
#                     """
#                     INSERT INTO users (email, password_hash, role)
#                     VALUES (%s, %s, %s)
#                     RETURNING id, email, role, is_active, is_verified, last_login, created_at, updated_at;
#                     """,
#                     (email, password_hash, role)
#                 )
#                 user = cur.fetchone()
#                 user_id = user["id"]
#                 logger.info(f"Created user with ID: {user_id}, email: {email}, role: {role}")
#                 
#                 # Create corresponding therapist or parent record
#                 if role == "therapist":
#                     cur.execute(
#                         """
#                         INSERT INTO therapists (user_id, first_name, last_name, email, phone, bio, is_active)
#                         VALUES (%s, %s, %s, %s, %s, %s, %s)
#                         RETURNING id, user_id, first_name, last_name, email, phone, bio, is_active, created_at, updated_at;
#                         """,
#                         (user_id, first_name, last_name, email, phone, '', True)
#                     )
#                     profile = cur.fetchone()
#                     user["profile"] = profile
#                     logger.info(f"Created therapist profile with ID: {profile['id']}")
#                     
#                 elif role == "parent":
#                     cur.execute(
#                         """
#                         INSERT INTO parents (user_id, first_name, last_name, email, phone, address, emergency_contact, is_active)
#                         VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#                         RETURNING id, user_id, first_name, last_name, email, phone, address, emergency_contact, is_active, created_at, updated_at;
#                         """,
#                         (user_id, first_name, last_name, email, phone, address, emergency_contact, True)
#                     )
#                     profile = cur.fetchone()
#                     user["profile"] = profile
#                     logger.info(f"Created parent profile with ID: {profile['id']}")
#                 
#                 conn.commit()
#         return user
#     except psycopg2.IntegrityError as e:
#         logger.error(f"Integrity error creating user {email}: {e}")
#         conn.rollback()
#         raise
#     except Exception as e:
#         logger.error(f"Error creating user {email}: {e}")
#         conn.rollback()
#         raise
#     finally:
#         conn.close()
