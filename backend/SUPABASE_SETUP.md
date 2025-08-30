# ThrivePath Supabase Setup Instructions

## 🔑 Required Keys (Add to .env file)

### Step 1: Get Your Supabase Keys
1. Go to your **Supabase Dashboard**
2. Navigate to **Settings → API**
3. Copy the following values:

### Step 2: Update .env file with these keys:

```env
# TODO: Replace these placeholders with actual values from Supabase Dashboard

# From "Project URL"
SUPABASE_URL=https://qrpbmnqqmwvnuqlceqpt.supabase.co

# From "Public API Key (anon)" 
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_ANON_KEY_HERE

# From "Service Role Key" (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE

# Your database password (same as your Supabase project password)
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
```

## 🛠️ Setup Steps

### Step 3: Install Dependencies
```bash
cd backend
pip install -r others/requirements.txt
```

### Step 4: Test Connections
```bash
# Test PostgreSQL connection
python -c "from db import test_connection; print(test_connection())"

# Test Supabase client (after adding keys)
python -c "from db import test_supabase_client; print(test_supabase_client())"
```

### Step 5: Setup Database
```bash
# Run the setup script to create tables
python supabase_setup.py
```

### Step 6: Start the API
```bash
python app.py
```

### Step 7: Test Endpoints
- Database test: `GET http://localhost:8000/api/test-db`
- Supabase client test: `GET http://localhost:8000/api/test-supabase`
- Health check: `GET http://localhost:8000/health`

## 🔍 Troubleshooting

### Connection Issues:
- Ensure your IP is allowed in Supabase (check Settings → Database → Network Restrictions)
- Verify your password is correct
- Check that SSL is enabled (required for Supabase)

### Missing Keys:
- Double-check you copied the full keys from Supabase Dashboard
- Ensure no extra spaces or characters
- Restart your Python server after updating .env

### Table Creation:
- Make sure you have proper permissions
- Check Supabase logs in the dashboard
- Verify the database schema matches your requirements

## 📋 What's Been Updated

1. **Database Connection**: Both direct PostgreSQL and Supabase client support
2. **Environment Variables**: Clear placeholders for all required keys
3. **Error Handling**: Better logging and error messages
4. **Testing**: Endpoints to verify both connection methods
5. **Setup Script**: Automated table creation with RLS
6. **Dependencies**: Added Supabase Python client

## 🎯 Next Steps After Setup

1. Test user registration: `POST /api/register`
2. Test user login: `POST /api/login`
3. Verify profile creation works
4. Check that tables are populated in Supabase dashboard

## 🔐 Security Notes

- Never commit your actual keys to git
- Keep SERVICE_ROLE_KEY secret (server-side only)
- ANON_KEY can be used in frontend
- Enable RLS policies for production use
