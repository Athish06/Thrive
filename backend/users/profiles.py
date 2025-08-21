from db import get_db_connection
from typing import Optional, Dict, Any

def get_therapist_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Get therapist profile by user_id"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, first_name, last_name, email, phone, bio, 
                       is_active, created_at, updated_at
                FROM therapists 
                WHERE user_id = %s
                """,
                (user_id,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def get_parent_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Get parent profile by user_id"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, first_name, last_name, email, phone, address, 
                       emergency_contact, is_active, created_at, updated_at
                FROM parents 
                WHERE user_id = %s
                """,
                (user_id,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def update_therapist_profile(user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """Update therapist profile"""
    conn = get_db_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # Build dynamic update query
                update_fields = []
                values = []
                
                allowed_fields = ['first_name', 'last_name', 'phone', 'bio']
                for field in allowed_fields:
                    if field in kwargs and kwargs[field] is not None:
                        update_fields.append(f"{field} = %s")
                        values.append(kwargs[field])
                
                if not update_fields:
                    return get_therapist_profile(user_id)
                
                # Add updated_at
                update_fields.append("updated_at = NOW()")
                values.append(user_id)
                
                query = f"""
                    UPDATE therapists 
                    SET {', '.join(update_fields)}
                    WHERE user_id = %s
                    RETURNING id, user_id, first_name, last_name, email, phone, bio, 
                             is_active, created_at, updated_at
                """
                
                cur.execute(query, values)
                return cur.fetchone()
    finally:
        conn.close()

def update_parent_profile(user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """Update parent profile"""
    conn = get_db_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # Build dynamic update query
                update_fields = []
                values = []
                
                allowed_fields = ['first_name', 'last_name', 'phone', 'address', 'emergency_contact']
                for field in allowed_fields:
                    if field in kwargs and kwargs[field] is not None:
                        update_fields.append(f"{field} = %s")
                        values.append(kwargs[field])
                
                if not update_fields:
                    return get_parent_profile(user_id)
                
                # Add updated_at
                update_fields.append("updated_at = NOW()")
                values.append(user_id)
                
                query = f"""
                    UPDATE parents 
                    SET {', '.join(update_fields)}
                    WHERE user_id = %s
                    RETURNING id, user_id, first_name, last_name, email, phone, address, 
                             emergency_contact, is_active, created_at, updated_at
                """
                
                cur.execute(query, values)
                return cur.fetchone()
    finally:
        conn.close()
