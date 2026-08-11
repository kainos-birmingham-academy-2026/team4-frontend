# US024 Registration System Workstreams

## Product Vision
Build an online job application platform that supports two audiences:
- Kainos recruitment admins, who can retrieve and update job roles and related information
- Applicants, who can apply for roles

This document breaks US024 (Registration) into UI, API, and Database workstreams, and defines what belongs in the frontend and backend repositories.

---

## Ticket Breakdown

### 1) UI Workstream

**Ticket title:** Build registration screen with validation and submission flow

**Repository:** Frontend repo

**Scope:**
- Create a registration page with:
	- Email input
	- Password input
	- Confirm password input
	- Submit button
- Add client-side validation:
	- Email must be valid format
	- Password must be more than 8 characters
	- Password must include uppercase, lowercase, and a special character
	- Confirm password must match password
- Show clear inline validation messages
- Submit form data to backend registration endpoint
- Handle backend responses:
	- Success state and navigation to login or home
	- Error states (validation failure, duplicate email, server error)

**Out of scope:**
- Role assignment logic
- Password hashing
- Database schema changes

**Definition of Done:**
- User can submit valid registration data
- Invalid inputs are blocked with readable error messages
- No role selection is available in the UI
- Form behavior covered by frontend tests

---

### 2) API Workstream

**Ticket title:** Implement registration endpoint with secure password handling

**Repository:** Backend repo

**Scope:**
- Implement endpoint (example: POST /auth/register)
- Accept email and password in request body
- Validate server-side:
	- Valid email format
	- Password strength requirements from acceptance criteria
- Ensure role is not client-controlled:
	- Ignore role if provided by client
	- Set role to user in service logic
- Check for duplicate email before account creation
- Salt and hash password before storage
	- Preferred: Argon2id
	- Acceptable: bcrypt with strong cost factor
- Return safe response object (never return password hash)

**Out of scope:**
- UI rendering
- Database migration authoring (covered in DB workstream)

**Definition of Done:**
- Valid requests create users successfully
- Invalid email returns HTTP 400
- Weak password returns HTTP 400
- Duplicate email returns HTTP 409
- Client-provided admin role is ignored and stored role remains user
- Unit and integration tests added

---

### 3) Database Workstream

**Ticket title:** Add user schema and constraints for registration

**Repository:** Backend repo

**Scope:**
- Create or update users table/model with fields:
	- id
	- email
	- password_hash
	- role
	- created_at
	- updated_at
- Add unique constraint and index on email
- Set database default role to user
- Ensure only hashed password is stored
- Add migration file and rollback compatibility

**Out of scope:**
- Endpoint/controller implementation
- Frontend form validation

**Definition of Done:**
- Email uniqueness enforced at database level
- Role defaults to user when omitted
- Plain text password is never persisted
- Migration is applied and verified in development

---

## Frontend vs Backend Repository Ownership

| Area | Frontend Repo | Backend Repo |
|---|---|---|
| Registration form UI | Yes | No |
| Client-side validation UX | Yes | No |
| API endpoint implementation | No | Yes |
| Server-side validation | No | Yes |
| Password salting and hashing | No | Yes |
| Role default enforcement | No | Yes |
| User table schema/migrations | No | Yes |
| Duplicate email constraint | No | Yes |
| Integration tests for endpoint | No | Yes |

---

## Acceptance Criteria Traceability

1. User must be able to register with email and password.
	 - Covered by UI form, API endpoint, and DB insert flow.

2. Role should default to user role in database (not admin).
	 - Enforced in backend service and DB default constraint.

3. Email must be a valid email format.
	 - Checked in frontend for UX and backend for source-of-truth validation.

4. Password must be more than 8 chars with upper, lower, and special char.
	 - Checked in frontend for immediate feedback and backend for enforcement.

5. Password should be salted and hashed.
	 - Implemented in backend before persistence using Argon2id (or bcrypt).

---

## Suggested Delivery Order

1. Database migration and constraints
2. API endpoint and server-side validation
3. Frontend registration flow and client-side validation
4. End-to-end verification across both repos

This sequence reduces integration issues and guarantees backend contracts exist before frontend wiring.
