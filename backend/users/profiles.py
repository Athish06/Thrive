# from db import get_db_connection
from db import get_supabase_client, format_supabase_response, handle_supabase_error
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

def get_therapist_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Get therapist profile by user_id using Supabase"""
    try:
        client = get_supabase_client()
        
        response = client.table('therapists').select('*').eq('user_id', user_id).execute()
        handle_supabase_error(response)
        
        profiles = format_supabase_response(response)
        if profiles:
            return profiles[0]
        return None
    except Exception as e:
        logger.error(f"Error getting therapist profile for user {user_id}: {e}")
        return None

def get_parent_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Get parent profile by user_id using Supabase"""
    try:
        client = get_supabase_client()
        
        response = client.table('parents').select('*').eq('user_id', user_id).execute()
        handle_supabase_error(response)
        
        profiles = format_supabase_response(response)
        if profiles:
            return profiles[0]
        return None
    except Exception as e:
        logger.error(f"Error getting parent profile for user {user_id}: {e}")
        return None

def update_therapist_profile(user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """Update therapist profile using Supabase"""
    try:
        client = get_supabase_client()
        
        # Build update data
        update_data = {}
        allowed_fields = ['first_name', 'last_name', 'phone', 'bio']
        
        for field in allowed_fields:
            if field in kwargs and kwargs[field] is not None:
                update_data[field] = kwargs[field]
        
        if not update_data:
            return get_therapist_profile(user_id)
        
        # Add updated_at timestamp
        from datetime import datetime
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        response = client.table('therapists').update(update_data).eq('user_id', user_id).execute()
        handle_supabase_error(response)
        
        profiles = format_supabase_response(response)
        if profiles:
            logger.info(f"Updated therapist profile for user {user_id}")
            return profiles[0]
        return None
    except Exception as e:
        logger.error(f"Error updating therapist profile for user {user_id}: {e}")
        return None

def update_parent_profile(user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """Update parent profile using Supabase"""
    try:
        client = get_supabase_client()
        
        # Build update data
        update_data = {}
        allowed_fields = ['first_name', 'last_name', 'phone', 'address', 'emergency_contact']
        
        for field in allowed_fields:
            if field in kwargs and kwargs[field] is not None:
                update_data[field] = kwargs[field]
        
        if not update_data:
            return get_parent_profile(user_id)
        
        # Add updated_at timestamp
        from datetime import datetime
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        response = client.table('parents').update(update_data).eq('user_id', user_id).execute()
        handle_supabase_error(response)
        
        profiles = format_supabase_response(response)
        if profiles:
            logger.info(f"Updated parent profile for user {user_id}")
            return profiles[0]
        return None
    except Exception as e:
        logger.error(f"Error updating parent profile for user {user_id}: {e}")
        return None

# COMMENTED OUT: Direct PostgreSQL versions (keeping for reference)
# def get_therapist_profile(user_id: int) -> Optional[Dict[str, Any]]:
#     """Get therapist profile by user_id"""
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute(
#                 """
#                 SELECT id, user_id, first_name, last_name, email, phone, bio, 
#                        is_active, created_at, updated_at
#                 FROM therapists 
#                 WHERE user_id = %s
#                 """,
#                 (user_id,)
#             )
#             return cur.fetchone()
#     finally:
#         conn.close()

# def get_parent_profile(user_id: int) -> Optional[Dict[str, Any]]:
#     """Get parent profile by user_id"""
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute(
#                 """
#                 SELECT id, user_id, first_name, last_name, email, phone, address, 
#                        emergency_contact, is_active, created_at, updated_at
#                 FROM parents 
#                 WHERE user_id = %s
#                 """,
#                 (user_id,)
#             )
#             return cur.fetchone()
#     finally:
#         conn.close()

# def update_therapist_profile(user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
#     """Update therapist profile"""
#     conn = get_db_connection()
#     try:
#         with conn:
#             with conn.cursor() as cur:
#                 # Build dynamic update query
#                 update_fields = []
#                 values = []
#                 
#                 allowed_fields = ['first_name', 'last_name', 'phone', 'bio']
#                 for field in allowed_fields:
#                     if field in kwargs and kwargs[field] is not None:
#                         update_fields.append(f"{field} = %s")
#                         values.append(kwargs[field])
#                 
#                 if not update_fields:
#                     return get_therapist_profile(user_id)
#                 
#                 # Add updated_at
#                 update_fields.append("updated_at = NOW()")
#                 values.append(user_id)
#                 
#                 query = f"""
#                     UPDATE therapists 
#                     SET {', '.join(update_fields)}
#                     WHERE user_id = %s
#                     RETURNING id, user_id, first_name, last_name, email, phone, bio, 
#                              is_active, created_at, updated_at
#                 """
#                 
#                 cur.execute(query, values)
#                 return cur.fetchone()
#     finally:
#         conn.close()

# def update_parent_profile(user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
#     """Update parent profile"""
#     conn = get_db_connection()
#     try:
#         with conn:
#             with conn.cursor() as cur:
#                 # Build dynamic update query
#                 update_fields = []
#                 values = []
#                 
#                 allowed_fields = ['first_name', 'last_name', 'phone', 'address', 'emergency_contact']
#                 for field in allowed_fields:
#                     if field in kwargs and kwargs[field] is not None:
#                         update_fields.append(f"{field} = %s")
#                         values.append(kwargs[field])
#                 
#                 if not update_fields:
#                     return get_parent_profile(user_id)
#                 
#                 # Add updated_at
#                 update_fields.append("updated_at = NOW()")
#                 values.append(user_id)
#                 
#                 query = f"""
#                     UPDATE parents 
#                     SET {', '.join(update_fields)}
#                     WHERE user_id = %s
#                     RETURNING id, user_id, first_name, last_name, email, phone, address, 
#                              emergency_contact, is_active, created_at, updated_at
#                 """
#                 
#                 cur.execute(query, values)
#                 return cur.fetchone()
#     finally:
#         conn.close()
