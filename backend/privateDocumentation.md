# Internal API Documentation (Insiders)

This document is intended for developers and maintainers. It covers folder structure, environment setup, database schema, middleware, service patterns, and detailed examples for each endpoint.

---
## 1. Folder Structure

```
src/
├── config/
│   ├── supabase.js        # Supabase client
│   ├── authMiddleWare.js  # authenticateUser, rate-limiters
│   └── email.js           # Nodemailer transporter
├── utils/
│   ├── asyncWrapper.js    # Wraps async handlers
│   └── validateSchema.js  # Zod validation middleware
├── validators/            # Zod schemas for request bodies
│   ├── authValidator.js
│   ├── profileValidator.js
│   ├── projectValidator.js
│   ├── eventValidator.js
│   └── commentValidator.js
├── services/              # Business logic & DB interactions
│   ├── authService.js
│   ├── profileService.js
│   ├── projectService.js
│   ├── eventService.js
│   ├── commentService.js
│   └── notificationService.js
├── routes/                # Express routers
│   ├── auth.js
│   ├── profile.js
│   ├── project.js
│   ├── event.js
│   ├── notifications.js
│   └── upload.js
└── index.js               # App initialization (Helmet, CORS, rate limiting)
```

---
## 2. Environment Variables

| Key               | Description                                         |
|-------------------|-----------------------------------------------------|
| `DATABASE_URL`    | Supabase connection string                          |
| `SUPABASE_KEY`    | Supabase service role API key                       |
| `JWT_SECRET`      | Secret for signing JWT tokens                       |
| `ENCRYPTION_KEY`  | Key for AES encryption of payloads                  |
| `EMAIL_USER`      | Gmail address for sending notifications             |
| `EMAIL_PASSWORD`  | App password for the Gmail account                  |
| `FRONTEND_URL`    | Allowed origin for CORS                             |
| `PORT`            | Server port (default `5000`)                        |

---
## 3. Database Schema (PostgreSQL)

```sql
-- Profiles\CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Codes
CREATE TABLE verification_codes (
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL
);

-- User Tokens
CREATE TABLE user_tokens (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id)
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Members
CREATE TABLE project_members (
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT,
  PRIMARY KEY (project_id, user_id)
);

-- Events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Comments
CREATE TABLE event_comments (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---
## 4. Middleware & Security

- **Helmet**: adds common security headers.
- **CORS**: restricts to `FRONTEND_URL`.
- **Rate Limiters**:
  - `authLimiter`: 5 req / 15min on signup/login.
  - `generalLimiter`: 100 req / 15min on other routes.
- **asyncWrapper**: catches async errors.
- **validateSchema**: applies Zod parsing + validation.

---
## 5. Service Patterns

Each router calls a corresponding `services/*.js` function. Services:
- Enforce business rules (permissions, validations beyond schema)
- Perform Supabase queries
- Throw errors with `err.status`

Example: `projectService.createProject(userId, data)`

---
## 6. Endpoint Examples (cURL)

### Signup
```bash
curl -X POST https://api.example.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@foo.com","password":"Pass1234"}'
```

### Create Project
```bash
curl -X POST https://api.example.com/api/projects \
  -H "Content-Type: application/json" \
  --cookie "auth_token=<token>; refresh_token=<rftoken>" \
  -d '{"name":"New App","description":"...","startDate":"2025-05-01","endDate":"2025-06-01","status":"planning"}'
```

### List Events
```bash
curl https://api.example.com/api/events?limit=5&offset=0 \
  --cookie "auth_token=<token>"
```

### Post Comment
```
POST /api/events/123/comments
{ "content": "Great event!" }
```

---
## 7. Extending & Debugging

- **Adding a new endpoint**:  
  1. Define Zod schema in `validators/`  
  2. Create service function in `services/`  
  3. Add route in `routes/` with `validate()`, `wrapAsync()`, and `authenticateUser` or `generalLimiter` as needed.  

- **Logging & Monitoring**:
  Integrate a logger (Winston/Pino) in `index.js` and replace `console.error` in error handler.

- **Testing**:
  - Unit-test services with Supabase mocked (e.g. using `jest.mock`).  
  - Integration tests against a dedicated test database.  



