import bcrypt
from db import get_db_connection
import psycopg2
from psycopg2 import sql
from typing import Optional

def create_user(email: str, password: str, role: str, first_name: str = None, last_name: str = None, 
                phone: str = None, address: str = None, emergency_contact: str = None) -> dict:
	"""
	Create a new user in the database and corresponding therapist/parent record.
	Returns the created user dict (without password hash).
	Raises psycopg2.IntegrityError if email already exists.
	"""
	if role not in ("therapist", "parent"):
		raise ValueError("Invalid role")
	
	password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
	conn = get_db_connection()
	
	try:
		with conn:
			with conn.cursor() as cur:
				# Create user record
				cur.execute(
					"""
					INSERT INTO users (email, password_hash, role)
					VALUES (%s, %s, %s)
					RETURNING id, email, role, is_active, is_verified, last_login, created_at, updated_at;
					""",
					(email, password_hash, role)
				)
				user = cur.fetchone()
				user_id = user["id"]
				
				# Create corresponding therapist or parent record
				if role == "therapist":
					cur.execute(
						"""
						INSERT INTO therapists (user_id, first_name, last_name, email, phone)
						VALUES (%s, %s, %s, %s, %s)
						RETURNING id, first_name, last_name, email, phone, created_at;
						""",
						(user_id, first_name or '', last_name or '', email, phone)
					)
					profile = cur.fetchone()
					user["profile"] = profile
					
				elif role == "parent":
					cur.execute(
						"""
						INSERT INTO parents (user_id, first_name, last_name, email, phone, address, emergency_contact)
						VALUES (%s, %s, %s, %s, %s, %s, %s)
						RETURNING id, first_name, last_name, email, phone, address, emergency_contact, created_at;
						""",
						(user_id, first_name or '', last_name or '', email, phone, address, emergency_contact)
					)
					profile = cur.fetchone()
					user["profile"] = profile
				
		return user
	finally:
		conn.close()
