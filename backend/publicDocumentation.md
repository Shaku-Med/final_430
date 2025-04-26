# Public API Documentation

Welcome to the public reference for our RESTful API. This document gives an overview of available endpoints, basic usage patterns, and authentication requirements.

---
## Base URL

```
https://<your-domain>.com/api
```

> Replace `<your-domain>` with your deployed backend URL.

---
## Authentication

Most endpoints require a valid JWT in an HttpOnly cookie (`auth_token`).

| Endpoint               | Method | Description                         | Auth    |
|------------------------|--------|-------------------------------------|---------|
| `/signup`              | POST   | Register with email & password      | No      |
| `/verify-code`         | POST   | Confirm email with verification code| No      |
| `/login`               | POST   | Authenticate and receive session    | No      |
| `/refresh-token`       | POST   | Rotate JWT using refresh cookie     | Yes     |


---
## Core Endpoints

### Profiles

- **List profiles** (admin only)
  - `GET /profiles?limit=<n>&offset=<m>`
- **Get profile**
  - `GET /profiles/:id`
- **Update profile**
  - `PUT /profiles/:id` (body fields: `username`, `full_name`, `avatar_url`)
- **Delete profile**
  - `DELETE /profiles/:id`

### Projects

- **List**
  - `GET /projects?limit=<n>&offset=<m>`
- **Create**
  - `POST /projects` (body: `name`, `description`, `startDate`, `endDate`, `status`)
- **Retrieve**
  - `GET /projects/:id`
- **Update**
  - `PUT /projects/:id`
- **Delete**
  - `DELETE /projects/:id`
- **Members**
  - `POST /projects/:id/members` (body: `userId`, `role`)
  - `GET /projects/:id/members`
  - `DELETE /projects/:id/members/:userId`

### Upload

- **Profile Picture**
  - `POST /profile-picture` (body: `fileData`, `fileName`, `fileType`)

### Events & Comments

- **Events**
  - `GET /events?limit=<n>&offset=<m>`
  - `GET /events/:id`
  - `POST /events` (admin only)
  - `PUT /events/:id` (creator only)
  - `DELETE /events/:id`

- **Comments**
  - `GET /events/:id/comments`  
  - `POST /events/:id/comments` (body: `content`)
  - `DELETE /events/:id/comments/:commentId`

### Notifications

- **List notifications**
  - `GET /notifications?limit=<n>&offset=<m>`
- **Mark read**
  - `PUT /notifications/:id/read`

---
## Error Handling

All errors return JSON:

```json
{ "error": "Descriptive error message" }
```

Status codes:
- `400` Bad request or validation failure
- `401` Unauthorized
- `403` Forbidden
- `404` Not found
- `500` Internal error

---
## Getting Started

1. Register via `POST /signup`.
2. Confirm email with `POST /verify-code`.
3. Login via `POST /login`.
4. Use returned session cookies to access other endpoints.

For more details, see the internal documentation.

