# Supabase Authentication Project

This project implements a secure user authentication system using Supabase, an open-source Firebase alternative, integrated with a React application. It provides a robust authentication flow with email/password signup, login, anonymous login, and logout functionality, enhanced with security measures like rate limiting, CSRF protection, session management, and input validation. The application uses React with Vite for the frontend, Supabase for authentication and database, and includes a dashboard for authenticated users.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Prerequisites](#prerequisites)  
- [Setup Instructions](#setup-instructions)  
- [Authentication Flow](#authentication-flow)  
- [Security Features](#security-features)  
- [Usage](#usage)  
- [Environment Variables](#environment-variables)  
- [Contributing](#contributing)  
- [License](#license)

---

## Features

### User Authentication:
- Email/password signup and login  
- Anonymous (guest) login  
- Secure logout with session cleanup  

### Security Measures:
- Rate limiting to prevent brute-force attacks (5 attempts per 15 minutes for auth, 10 per minute for general actions)  
- CSRF token protection for form submissions  
- Input sanitization and validation to prevent XSS and SQL injection  
- Session timeout (30 minutes) with warning (25 minutes)  
- Device fingerprinting for enhanced security  
- Password strength validation with real-time feedback  

### UI Components:
- Responsive authentication form with login/signup toggle  
- Password strength indicator for signup  
- Security alerts for errors and rate-limiting warnings  
- Dashboard displaying user information and security status  

### Integration with Supabase:
- Uses Supabase Auth with PKCE flow for secure token management  
- Row Level Security (RLS) compatible for database access control  

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React (icons)  
- **Backend**: Supabase (Authentication, Postgres Database)  
- **Libraries**:
  - `@supabase/supabase-js`: Supabase JavaScript client  
  - `zod`: Schema validation for inputs  
- **Security**: Custom utilities for CSRF, rate limiting, and session management  

---

## Project Structure

```
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── AuthForm.jsx        # Authentication form component
│   │   ├── Dashboard.jsx       # User dashboard component
│   │   ├── PasswordStrengthIndicator.jsx  # Password strength feedback
│   │   ├── SecurityAlert.jsx   # Security alert notifications
│   ├── hooks/
│   │   ├── useSecureAuth.js    # Custom hook for authentication logic
│   ├── lib/
│   │   ├── supabaseClient.js   # Supabase client initialization
│   ├── utils/
│   │   ├── security.js         # Security utilities (rate limiting, CSRF, etc.)
│   │   ├── validation.js       # Input validation and sanitization
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
├── .env                        # Environment variables
├── README.md                   # Project documentation
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
```

---

## Prerequisites

- Node.js (v16 or higher)  
- npm or yarn  
- Supabase Account: Create a project at [Supabase Dashboard](https://app.supabase.com)  
- Git for version control  

---

## Setup Instructions

### Clone the Repository:

```bash
git clone <repository-url>
cd <project-directory>
```

### Install Dependencies:

```bash
npm install
# or
yarn install
```

### Set Up Supabase:

1. Create a new project in the Supabase Dashboard.  
2. Enable email authentication in **Authentication > Providers**. (Disable "Confirm email" for dev)  
3. Copy the Project URL and Anon Key from **Settings > API**.  
4. (Optional) For production, configure a custom SMTP server.

### Configure Environment Variables:

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> Replace `your-supabase-project-url` and `your-supabase-anon-key` with actual values.

### Run the Application:

```bash
npm run dev
# or
yarn dev
```

App will be available at: [http://localhost:5173](http://localhost:5173)

### (Optional) Local Development with Supabase CLI:

```bash
npm install -g @supabase/supabase-cli
supabase start
```

Use the local Supabase URL and keys in your `.env`.  
Use Inbucket (provided URL) to test email flows.

---

## Authentication Flow

### Signup:

- User inputs email and password in `AuthForm`.  
- Validated with Zod schema via `validation.js`.  
- `useSecureAuth.js` calls `supabase.auth.signUp` with PKCE flow.  
- On success, redirects to Dashboard.  

### Login:

- Inputs validated and sanitized.  
- Calls `supabase.auth.signInWithPassword`.  
- JWT stored securely in localStorage.  

### Anonymous Login:

- Calls `supabase.auth.signInAnonymously`.  
- Creates limited session for guests.  

### Logout:

- `useSecureAuth.js` calls `supabase.auth.signOut`.  
- Local/session storage cleared.  
- `SessionManager` removes timeout handlers.  

### Session Management:

- `validateSession` checks JWT and refreshes if needed.  
- `SessionManager` triggers warning at 25 minutes, logout at 30.  

---

## Security Features

- **Rate Limiting**: 5 auth attempts per 15 minutes, 10 general per minute.  
- **CSRF Protection**: Tokens generated and verified for forms.  
- **Input Validation**: Strong email/password rules via Zod.  
- **XSS/SQLi Prevention**: Input sanitization.  
- **Device Fingerprinting**: Unique device ID for enhanced tracking.  
- **Session Security**: PKCE, secure JWT storage, auto-logout.  
- **Headers**: X-Frame-Options, X-XSS-Protection, and more.  

---

## Usage

### Access the App:

Go to: [http://localhost:5173](http://localhost:5173)  
Switch between login/signup in `AuthForm`.

### Signup/Login:

- Enter valid credentials.  
- Signup enforces strong passwords.  
- Use "Continue as Guest" for anonymous access.  

### Dashboard:

- Displays email, last sign-in, and device ID.  
- Shows status of rate limits and session timers.  
- Logout button available.  

### Testing Security:

- Try 5 failed logins to test rate limit.  
- Stay idle for 25 minutes to test session warning.  
- Wait for 30 minutes for auto logout.

---

## Environment Variables

| Variable               | Description                | Required |
|------------------------|----------------------------|----------|
| VITE_SUPABASE_URL      | Supabase project URL       | Yes      |
| VITE_SUPABASE_ANON_KEY | Supabase public anon key   | Yes      |

> ⚠️ The Anon Key is safe for client use due to Row Level Security (RLS).

---

## Contributing

1. Fork the repository.  
2. Create a feature branch:  
   ```bash
   git checkout -b feature-name
   ```  
3. Commit your changes:  
   ```bash
   git commit -m "Add feature"
   ```  
4. Push to your branch:  
   ```bash
   git push origin feature-name
   ```  
5. Open a Pull Request.

Please follow [Supabase Contributing Guide](https://github.com/supabase/supabase/blob/master/CONTRIBUTING.md) for detailed guidelines.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

_Made with ❤️ using [Supabase](https://supabase.com)_
