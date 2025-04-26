# Backend API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Profiles](#profiles)
- [Projects](#projects)
- [Uploads](#uploads)
- [Error Handling](#error-handling)

## Authentication

All endpoints require authentication unless otherwise specified. Include the authentication token in the request header:

```
Authorization: Bearer <token>
```

## Profiles

### Get All Profiles
```http
GET /api/profiles
```

**Description**: Get all user profiles (admin only)

**Response**:
```json
[
  {
    "id": "string",
    "username": "string",
    "full_name": "string",
    "avatar_url": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Get Profile by ID
```http
GET /api/profiles/:id
```

**Description**: Get a specific user's profile

**Parameters**:
- `id` (path): User ID

**Response**:
```json
{
  "id": "string",
  "username": "string",
  "full_name": "string",
  "avatar_url": "string",
  "email": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Update Profile
```http
PUT /api/profiles/:id
```

**Description**: Update a user's profile

**Parameters**:
- `id` (path): User ID

**Request Body**:
```json
{
  "username": "string",
  "full_name": "string",
  "avatar_url": "string"
}
```

**Response**: Updated profile object

### Delete Profile
```http
DELETE /api/profiles/:id
```

**Description**: Delete a user's profile

**Parameters**:
- `id` (path): User ID

**Response**:
```json
{
  "message": "Profile deleted successfully",
  "deletedProfile": {
    // Profile details
  }
}
```

## Projects

### Create Project
```http
POST /api/projects
```

**Description**: Create a new project

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date",
  "status": "string"
}
```

**Response**: Created project object

### Get All Projects
```http
GET /api/projects
```

**Description**: Get all projects

**Response**:
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "startDate": "date",
    "endDate": "date",
    "status": "string",
    "created_by": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Get Project by ID
```http
GET /api/projects/:id
```

**Description**: Get a specific project

**Parameters**:
- `id` (path): Project ID

**Response**: Project object

### Update Project
```http
PUT /api/projects/:id
```

**Description**: Update a project

**Parameters**:
- `id` (path): Project ID

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date",
  "status": "string"
}
```

**Response**: Updated project object

### Delete Project
```http
DELETE /api/projects/:id
```

**Description**: Delete a project

**Parameters**:
- `id` (path): Project ID

**Response**:
```json
{
  "message": "Project deleted successfully",
  "deletedProject": {
    // Project details
  }
}
```

### Project Members

#### Add Member
```http
POST /api/projects/:id/members
```

**Description**: Add a member to a project

**Parameters**:
- `id` (path): Project ID

**Request Body**:
```json
{
  "userId": "string",
  "role": "string"
}
```

**Response**: Created member object

#### Remove Member
```http
DELETE /api/projects/:id/members/:userId
```

**Description**: Remove a member from a project

**Parameters**:
- `id` (path): Project ID
- `userId` (path): User ID

**Response**:
```json
{
  "message": "Member removed successfully"
}
```

#### Get Project Members
```http
GET /api/projects/:id/members
```

**Description**: Get all members of a project

**Parameters**:
- `id` (path): Project ID

**Response**:
```json
[
  {
    "user_id": "string",
    "role": "string",
    "profiles": {
      "id": "string",
      "username": "string",
      "full_name": "string",
      "avatar_url": "string"
    }
  }
]
```

## Uploads

### Upload Profile Picture
```http
POST /api/upload/profile-picture
```

**Description**: Upload a profile picture for the authenticated user

**Request Body**:
```json
{
  "fileData": "base64 encoded image data",
  "fileName": "example.jpg",
  "fileType": "image/jpeg"
}
```

**Response**:
```json
{
  "message": "Profile picture uploaded successfully",
  "url": "https://your-supabase-url/profile-pictures/user-id/filename.jpg"
}
```

**Notes**:
- File size limit: 5MB
- Allowed file types: JPEG, PNG, GIF
- Files are stored in the 'profile-pictures' bucket
- Each file is given a unique UUID
- Files are organized by user ID in the bucket
- The profile's avatar_url is automatically updated

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

Common error messages:
- `Unauthorized - Please log in`: Authentication token missing or invalid
- `Forbidden - Admin access required`: User doesn't have admin privileges
- `Forbidden - Can only view own profile`: User trying to access another user's profile
- `Profile not found`: Requested profile doesn't exist
- `Project not found`: Requested project doesn't exist
- `Username already taken`: Username is already in use
- `Failed to [action]`: General server error 