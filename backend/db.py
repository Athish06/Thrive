import os
# import psycopg2
# from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import logging
from datetime import datetime

# Force reload environment variables
load_dotenv(override=True)

# Set up logging for database connections
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase client setup (primary database method)
supabase_client = None

def init_supabase_client():
    """
    Initialize Supabase client - primary database method
    """
    global supabase_client
    try:
        from supabase import create_client, Client
        
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role for backend operations
        
        if not url or not key or key == 'your_supabase_service_role_key_here':
            logger.error("Supabase client not initialized - missing URL or service role key")
            raise Exception("Missing Supabase configuration")
            
        supabase_client = create_client(url, key)
        logger.info("Supabase client initialized successfully")
        return supabase_client
    except ImportError:
        logger.error("Supabase package not installed - install with: pip install supabase")
        raise Exception("Supabase package not installed")
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {e}")
        raise

def get_supabase_client():
    """
    Get Supabase client instance (primary database method)
    """
    global supabase_client
    if supabase_client is None:
        supabase_client = init_supabase_client()
    return supabase_client

# COMMENTED OUT: Direct PostgreSQL connection (keeping for reference)
# def get_db_connection():
#     """
#     Get database connection for Supabase PostgreSQL using psycopg2
#     """
#     # Debug: Print connection details (without password)
#     db_host = os.getenv('DB_HOST')
#     db_port = os.getenv('DB_PORT')
#     db_user = os.getenv('DB_USER')
#     db_name = os.getenv('DB_NAME')
#     db_password = os.getenv('DB_PASSWORD')
#     
#     logger.info(f"Attempting to connect to: {db_host}:{db_port} as {db_user} to database {db_name}")
#     
#     if not all([db_host, db_port, db_user, db_name, db_password]):
#         logger.error("Missing required environment variables")
#         logger.error(f"DB_HOST: {db_host}, DB_PORT: {db_port}, DB_USER: {db_user}, DB_NAME: {db_name}")
#         raise Exception("Missing database configuration")
#     
#     try:
#         conn = psycopg2.connect(
#             host=db_host,
#             port=int(db_port),
#             user=db_user,
#             password=db_password,
#             dbname=db_name,
#             cursor_factory=RealDictCursor,
#             sslmode='require',  # Required for Supabase
#             connect_timeout=10,  # 10 second timeout
#             options='-c default_transaction_isolation=read_committed'
#         )
#         # Test the connection
#         with conn.cursor() as cur:
#             cur.execute('SELECT 1')
#         logger.info("Successfully connected to Supabase PostgreSQL database")
#         return conn
#     except psycopg2.OperationalError as e:
#         logger.error(f"Operational error connecting to database: {e}")
#         raise Exception(f"Database connection failed: {e}")
#     except psycopg2.Error as e:
#         logger.error(f"Database error: {e}")
#         raise Exception(f"Database error: {e}")
#     except Exception as e:
#         logger.error(f"Unexpected error connecting to database: {e}")
#         raise Exception(f"Unexpected database error: {e}")

def test_connection():
    """
    Test Supabase client connection (primary method)
    """
    try:
        client = get_supabase_client()
        # Test with a simple query to check connection
        response = client.table('therapists').select('id').limit(1).execute()
        logger.info("Supabase client connection successful")
        return True, "Supabase connection successful"
    except Exception as e:
        logger.error(f"Supabase connection test failed: {e}")
        return False, str(e)

# COMMENTED OUT: Direct PostgreSQL test (keeping for reference)
# def test_connection():
#     """
#     Test database connection and return status
#     """
#     try:
#         conn = get_db_connection()
#         with conn.cursor() as cur:
#             cur.execute('SELECT version()')
#             version = cur.fetchone()
#             logger.info(f"Database connection successful. PostgreSQL version: {version}")
#         conn.close()
#         return True, "Connection successful"
#     except Exception as e:
#         logger.error(f"Connection test failed: {e}")
#         return False, str(e)

def test_supabase_client():
    """
    Test Supabase client connection
    """
    return test_connection()  # Same as primary connection test now

# Helper functions for Supabase operations
def format_supabase_response(response):
    """
    Format Supabase response to match psycopg2 dict format
    """
    if hasattr(response, 'data') and response.data:
        return response.data
    return None

def handle_supabase_error(response):
    """
    Handle Supabase errors consistently
    """
    if hasattr(response, 'error') and response.error:
        logger.error(f"Supabase error: {response.error}")
        raise Exception(f"Database error: {response.error}")
    return response
