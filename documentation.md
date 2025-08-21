# ThrivePath - Therapy Planning Application
## Technical Documentation v1.0

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Development Timeline](#development-timeline)
4. [Authentication System](#authentication-system)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Frontend Architecture](#frontend-architecture)
8. [Critical Issues & Resolutions](#critical-issues--resolutions)
9. [Configuration Management](#configuration-management)
10. [Deployment Guide](#deployment-guide)
11. [Known Issues](#known-issues)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

**Project Name:** ThrivePath  
**Version:** 1.0.0  
**Type:** Full-Stack Web Application  
**Purpose:** Therapy planning and session management system for therapists and parents  

### Technology Stack
- **Frontend:** React 18.x with TypeScript, Vite, TailwindCSS
- **Backend:** FastAPI (Python), PostgreSQL
- **Authentication:** JWT (JSON Web Tokens) with PyJWT
- **State Management:** React Context API
- **Database:** PostgreSQL with psycopg2
- **Development Tools:** ESLint, TypeScript, Hot Module Replacement

### Core Features
- Role-based authentication (Therapist/Parent)
- User registration with automatic profile creation
- JWT-based session management
- Profile data integration
- Responsive UI with component-based architecture

---

## System Architecture

### High-Level Architecture
```
Frontend (React/TypeScript)
    ↓ HTTP/HTTPS
Backend API (FastAPI)
    ↓ SQL
PostgreSQL Database
```

### Component Structure
```
ThrivePath/
├── Frontend (React)
│   ├── Authentication Layer
│   ├── Context Management
│   ├── Protected Routes
│   └── UI Components
├── Backend (FastAPI)
│   ├── Authentication Module
│   ├── User Management
│   ├── Profile Management
│   └── API Endpoints
└── Database (PostgreSQL)
    ├── Users Table
    ├── Therapists Table
    └── Parents Table
```

---

## Development Timeline

### Phase 1: Initial Setup (Version 0.1)
**Objective:** Basic project structure and authentication framework

**Changes Made:**
- Created React TypeScript project with Vite
- Implemented basic JWT authentication system
- Established FastAPI backend structure
- Created PostgreSQL database schema

**Files Added/Modified:**
- `package.json` - Project dependencies
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling framework
- `backend/app.py` - Main FastAPI application
- `backend/auth.py` - Authentication logic
- `backend/schema.sql` - Database schema

### Phase 2: Authentication Enhancement (Version 0.2)
**Objective:** Implement comprehensive user authentication

**Changes Made:**
- Enhanced JWT token creation and validation
- Implemented role-based access control
- Created user registration with profile creation
- Added password hashing with bcrypt

**Key Components:**
- `authentication/authh.py` - JWT token management
- `users/users.py` - User creation logic
- `users/profiles.py` - Profile management

**Critical Issue Resolved:**
- **JWT Subject Type Error:** Fixed "Subject must be a string" error by converting user ID to string in JWT payload

### Phase 3: Frontend Integration (Version 0.3)
**Objective:** Connect frontend with backend authentication

**Changes Made:**
- Implemented AuthContext for global state management
- Created LoginPage and RegistrationPage components
- Added protected routes functionality
- Integrated JWT token storage in localStorage

**Files Modified:**
- `src/context/AuthContext.tsx` - Authentication state management
- `src/components/auth/LoginPage.tsx` - User login interface
- `src/components/auth/RegistrationPage.tsx` - User registration interface
- `src/components/shared/ProtectedRoute.tsx` - Route protection

### Phase 4: Profile Integration (Version 0.4)
**Objective:** Display user profile data in UI

**Changes Made:**
- Enhanced `/api/me` endpoint to include profile data
- Updated AuthContext to fetch user profiles
- Modified AppHeader to display actual user names
- Implemented automatic profile fetching on login

**Key Enhancement:**
- Users now see "Dr. Sarah Johnson" instead of "sarah@example.com" in the header

**Files Modified:**
- `backend/app.py` - Enhanced UserResponse model
- `src/context/AuthContext.tsx` - Profile fetching logic
- `src/components/layout/AppHeader.tsx` - Profile display

---

## Authentication System

### JWT Token Structure
```json
{
  "sub": "user_id_as_string",
  "email": "user@example.com", 
  "role": "therapist|parent",
  "exp": "expiration_timestamp"
}
```

### Authentication Flow
1. **Registration:**
   - User submits registration form
   - Backend creates user record in `users` table
   - Automatically creates corresponding profile in `therapists` or `parents` table
   - Redirects to login page with success notification

2. **Login:**
   - User submits credentials
   - Backend validates against database
   - JWT token generated with 30-minute expiration
   - Token stored in localStorage as `access_token`
   - User profile fetched and cached

3. **Session Management:**
   - All protected API calls include `Authorization: Bearer <token>` header
   - Backend validates token on each request
   - Token automatically expires after 30 minutes

### Security Features
- Password hashing using bcrypt
- JWT token expiration (30 minutes)
- Role-based access control
- CORS protection for cross-origin requests

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('therapist', 'parent')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Therapists Table
```sql
CREATE TABLE therapists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Parents Table
```sql
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/register
**Purpose:** Register new user with automatic profile creation

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "therapist",
  "phone": "+1234567890",
  "address": "123 Main St",
  "emergencyContact": "+9876543210"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "role": "therapist",
  "is_active": true,
  "is_verified": false,
  "created_at": "2025-08-21T16:30:00Z"
}
```

#### POST /api/login
**Purpose:** Authenticate user and return JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "therapist",
    "is_active": true,
    "is_verified": false,
    "created_at": "2025-08-21T16:30:00Z",
    "name": "John Doe"
  }
}
```

#### GET /api/me
**Purpose:** Get current user information with profile data

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "role": "therapist",
  "is_active": true,
  "is_verified": false,
  "created_at": "2025-08-21T16:30:00Z",
  "name": "Dr. John Doe"
}
```

### Profile Endpoints

#### GET /api/profile
**Purpose:** Get detailed profile information

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "emergency_contact": "+9876543210",
  "created_at": "2025-08-21T16:30:00Z",
  "updated_at": "2025-08-21T16:30:00Z"
}
```

---

## Frontend Architecture

### Context Management
**AuthContext** (`src/context/AuthContext.tsx`)
- Global authentication state
- User profile management
- Token storage and retrieval
- Automatic profile fetching

### Key Components

#### Authentication Components
- **LoginPage** - User authentication interface
- **RegistrationPage** - User registration with role selection
- **ProtectedRoute** - Route access control

#### Layout Components
- **AppHeader** - Navigation with user profile display
- **Sidebar** - Application navigation
- **MainContent** - Content area wrapper

#### Dashboard Components
- **TherapistDashboard** - Therapist-specific interface
- **ParentDashboard** - Parent-specific interface

### State Management Flow
```
User Action → AuthContext → API Call → State Update → UI Re-render
```

---

## Critical Issues & Resolutions

### Issue #1: JWT Subject Type Error
**Problem:** JWT token creation failing with "Subject must be a string" error

**Root Cause:** User ID from database (integer) passed directly to JWT `sub` field

**Solution:**
```python
# Before (BROKEN)
"sub": user["id"]  # Integer value

# After (FIXED)
"sub": str(user["id"])  # String value
```

**Files Modified:**
- `backend/app.py` - Line 118
- `backend/authentication/authh.py` - Lines 75-85

### Issue #2: Token Storage Inconsistency
**Problem:** 401 Unauthorized errors due to token retrieval mismatches

**Root Cause:** Inconsistent localStorage key usage between components

**Solution:** Standardized on `access_token` key throughout application

**Files Affected:**
- `src/context/AuthContext.tsx`
- `src/components/layout/AppHeader.tsx`

### Issue #3: Profile Data Not Displaying
**Problem:** User emails shown instead of actual names in UI

**Root Cause:** Separate profile fetching logic instead of integrated approach

**Solution:** Enhanced `/api/me` endpoint to include profile data automatically

**Implementation:**
```python
# Enhanced UserResponse model
class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: str
    name: Optional[str] = None  # Added profile name integration
```

### Issue #4: React Hook Dependencies
**Problem:** useEffect causing infinite re-renders

**Root Cause:** Missing or incorrect dependency arrays

**Solution:** Implemented useCallback for stable function references
```typescript
const fetchUserProfile = useCallback(async () => {
  // Profile fetching logic
}, [user]);
```

---

## Configuration Management

### Environment Variables (.env)
```properties
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ThrivePath

# JWT Configuration
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Configuration
- **Development Server:** http://localhost:5174
- **Backend API:** http://localhost:8000
- **CORS Origins:** Configured for local development

---

## Deployment Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL 12+

### Backend Setup
```bash
cd backend
pip install fastapi uvicorn psycopg2-binary bcrypt pyjwt python-dotenv
python app.py
```

### Frontend Setup
```bash
cd project
npm install
npm run dev
```

### Database Setup
```sql
-- Create database
CREATE DATABASE ThrivePath;

-- Run schema.sql to create tables
\i schema.sql
```

---

## Known Issues

### Current Limitations
1. **Token Refresh:** No automatic token refresh mechanism
2. **Password Reset:** Not implemented
3. **Email Verification:** User verification system incomplete
4. **Session Persistence:** Limited to localStorage (not secure for production)

### Security Considerations
1. **JWT Storage:** localStorage vulnerable to XSS attacks
2. **HTTPS:** Required for production deployment
3. **Rate Limiting:** Not implemented for API endpoints
4. **Input Validation:** Basic validation only

---

## Future Enhancements

### Planned Features
1. **Session Management:**
   - Refresh token implementation
   - Secure token storage (HttpOnly cookies)
   - Session timeout warnings

2. **Security Improvements:**
   - Email verification system
   - Password reset functionality
   - Two-factor authentication
   - API rate limiting

3. **User Experience:**
   - Profile editing interface
   - Dashboard customization
   - Notification system
   - Mobile responsive design

4. **Data Management:**
   - Client/patient management
   - Session scheduling
   - Progress tracking
   - Report generation

### Technical Debt
1. **Error Handling:** Implement comprehensive error boundaries
2. **Testing:** Add unit and integration tests
3. **Documentation:** API documentation with OpenAPI/Swagger
4. **Monitoring:** Application logging and monitoring
5. **Performance:** Database query optimization

---

## Maintenance Guidelines

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint configuration enforced
- Component props properly typed
- Database queries parameterized

### Version Control
- Feature branch workflow
- Commit message conventions
- Code review requirements
- Automated testing pipeline

### Monitoring & Logging
- Backend API request logging
- Frontend error tracking
- Database performance monitoring
- Security audit logging

---

**Document Version:** 1.0  
**Last Updated:** August 21, 2025  
**Author:** Development Team  
**Review Status:** Draft

---

*This documentation represents the current state of the ThrivePath application as of the development session. Regular updates should be made as the application evolves.*