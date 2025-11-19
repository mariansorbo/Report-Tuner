# Technical Requirement – Web Application

## 1. Authentication

The project must implement a robust authentication system with support for professional accounts and LinkedIn.

### The authentication flow must include:

#### 1.1. Login Providers

- **LinkedIn OAuth**
- **Google Workspace OAuth** (corporate Google accounts)
- **Azure AD OAuth** (corporate Microsoft accounts)
- **Auth0 (OIDC)** as a universal fallback provider
- **Session persistence in the browser** (secure cookies + JWT)

#### 1.2. Automatic User Creation

When a user logs in for the first time:

- A new user record must be created in the database
- The user must be automatically assigned to the `free_trial` plan
- The authentication provider must be stored
- The last login timestamp must be updated

#### 1.3. Login Notifications

Every time a user logs in (first-time or returning), an email notification must be sent to the configured admin inbox.

---

## 2. Full Database Integration

The web application must be fully connected to the provided SQL database, including:

- Creation and management of users, organizations, memberships, and invitations
- Validation of the `free_trial` plan limits using the existing SQL functions
- Uploading files associated with users or organizations
- Handling report states according to the defined schema

**Note**: Payment and upgrade logic will not be implemented yet, but the system must be prepared for seamless integration in the future.

---

## 3. Email (EmailJS)

- An email must be sent when someone submits the contact form
- An email must be sent when a user logs in
- Templates already exist; the developer only needs to integrate the credentials

---

## 4. Invitation Management

The full invitation flow must be implemented:

- Token generation
- Sending the invitation email
- Token validation
- Assigning the user role upon acceptance
- Ability to mark an organization as the user's primary org
- Token expiration handling

---

## 5. VirusTotal File Scanning

Every uploaded `.pbit` file must follow this security flow:

1. Temporary upload
2. Submit file to the VirusTotal API
3. Approve or block based on the result
4. Log the scan status inside the database

This must be integrated into the existing upload flow.

---

## 6. Current Project Status

The web application is already advanced, with:

- ✅ Structured and functional frontend
- ✅ Completed design system
- ✅ Fully designed database schema, stored procedures, and SQL functions

**The developer must:**

- Integrate backend, authentication, and database
- Connect real endpoints
- Implement the full logical flows and forms
- Prepare the system for production deployment

---

## 7. Credentials

The client already has all required credentials:

- OAuth (Google, Azure AD, LinkedIn, Auth0)
- EmailJS
- Azure SQL
- VirusTotal API

All credentials will be provided for integration.

---

## 8. Technology Stack

### 8.1 Current Stack (Frontend - Already Implemented)

**Frontend Framework:**
- **React 18.2.0** - UI library
- **Vite 7.2.2** - Build tool and dev server
- **React Context API** - State management (AuthContext, OrganizationContext)
- **CSS3** - Styling (component-based CSS files)

**Current Dependencies:**
- `@azure/storage-blob` (v12.17.0) - Azure Blob Storage integration
- `@emailjs/browser` (v4.4.1) - EmailJS client-side integration

**Project Structure:**
```
src/
├── components/          # React components (modals, panels, etc.)
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── services/           # Service layer (Azure Storage, EmailJS, etc.)
└── App.jsx             # Main application component
```

**Deployment:**
- Docker with multi-stage build
- Nginx for static file serving
- Configured for production deployment

### 8.2 Recommended Backend Stack

**IMPORTANT**: The current project is **frontend-only**. A backend server must be implemented to handle:

- OAuth callbacks and token exchange
- Database operations (Azure SQL)
- JWT generation and validation
- Server-side API endpoints
- File upload handling (before VirusTotal scan)

#### Recommended Backend Framework: **Node.js + Express**

**Why Node.js/Express:**
- Consistent JavaScript stack (frontend and backend)
- Excellent OAuth library support
- Strong Azure SQL integration (`mssql` or `tedious`)
- Easy JWT implementation
- Fast development cycle
- Good ecosystem for enterprise applications

#### Recommended Backend Dependencies:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "cookie-parser": "^1.4.6",
    "jsonwebtoken": "^9.0.2",
    "mssql": "^10.0.2",
    "passport": "^0.7.0",
    "passport-linkedin-oauth2": "^2.0.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-azure-ad": "^4.3.1",
    "passport-auth0": "^1.4.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "multer": "^1.4.5-lts.1",
    "axios": "^1.6.2",
    "bcryptjs": "^2.4.3"
  }
}
```

#### Alternative Backend Options:

1. **Next.js API Routes** (if migrating to Next.js)
   - Pros: Same React ecosystem, built-in API routes, SSR support
   - Cons: Requires refactoring frontend

2. **Fastify** (faster alternative to Express)
   - Pros: Better performance, modern async/await
   - Cons: Smaller ecosystem, less common

3. **NestJS** (enterprise-grade framework)
   - Pros: TypeScript, decorators, dependency injection, scalable
   - Cons: Steeper learning curve, more boilerplate

**Recommendation**: **Express.js** for fastest implementation and best compatibility with existing React frontend.

### 8.3 Recommended Libraries & Tools

#### Authentication:
- **Passport.js** - Authentication middleware for Node.js
  - `passport-linkedin-oauth2` - LinkedIn OAuth strategy
  - `passport-google-oauth20` - Google OAuth strategy
  - `passport-azure-ad` - Azure AD OAuth strategy
  - `passport-auth0` - Auth0 OAuth strategy
- **jsonwebtoken** - JWT token generation and validation

#### Database:
- **mssql** (v10.0.2) - Microsoft SQL Server driver for Node.js
  - Supports connection pooling
  - Async/await support
  - Azure SQL Database compatible
- Alternative: **tedious** (lower-level, more control)

#### Security:
- **helmet** - Security headers middleware
- **express-rate-limit** - Rate limiting for API endpoints
- **cors** - Cross-Origin Resource Sharing configuration

#### File Handling:
- **multer** - Multipart/form-data handling for file uploads
- **formidable** - Alternative file upload library

#### HTTP Client:
- **axios** - For VirusTotal API calls and external requests

### 8.4 Architecture Recommendation

```
┌─────────────────┐
│   React Frontend │  (Port 5173 - Vite Dev Server)
│   (Current)      │
└────────┬─────────┘
         │ HTTP/REST API
         │
┌────────▼─────────┐
│  Express Backend │  (Port 3000 - New)
│  (To Implement)  │
└────────┬─────────┘
         │
    ┌────┴────┬──────────┬──────────────┐
    │         │          │              │
┌───▼───┐ ┌──▼───┐ ┌────▼────┐ ┌───────▼────┐
│ Azure │ │EmailJS│ │VirusTotal│ │  OAuth    │
│  SQL  │ │       │ │   API    │ │ Providers │
└───────┘ └───────┘ └──────────┘ └───────────┘
```

**Backend API Endpoints Structure:**
```
/api/auth
  POST /auth/linkedin/callback
  POST /auth/google/callback
  POST /auth/azure/callback
  POST /auth/auth0/callback
  POST /auth/logout
  GET  /auth/me

/api/users
  GET    /users/:id
  PUT    /users/:id
  POST   /users (auto-created on OAuth)

/api/organizations
  GET    /organizations
  POST   /organizations
  GET    /organizations/:id
  PUT    /organizations/:id

/api/invitations
  POST   /invitations
  GET    /invitations/:token
  POST   /invitations/:token/accept

/api/reports
  POST   /reports/upload
  GET    /reports
  GET    /reports/:id

/api/contact
  POST   /contact
```

### 8.5 Environment Variables Structure

**Note**: All actual credentials will be provided separately. This is a template structure:

```env
# Server
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:5173

# Database
DATABASE_CONNECTION_STRING=Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=YOUR_DB;Persist Security Info=False;User ID=YOUR_USER;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;

# JWT
JWT_SECRET=your_jwt_secret_here
SESSION_EXPIRY=7d

# OAuth - LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# OAuth - Google Workspace
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# OAuth - Azure AD
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=common
AZURE_REDIRECT_URI=http://localhost:5173/auth/azure/callback

# OAuth - Auth0
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_DOMAIN=your_auth0_domain
AUTH0_REDIRECT_URI=http://localhost:5173/auth/auth0/callback

# EmailJS
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID_CONTACT=your_contact_template_id
EMAILJS_TEMPLATE_ID_LOGIN=your_login_template_id
EMAILJS_TEMPLATE_ID_INVITATION=your_invitation_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# VirusTotal
VIRUSTOTAL_API_KEY=your_virustotal_api_key
ENABLE_VIRUS_SCAN=true

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
AZURE_STORAGE_SAS_TOKEN=your_sas_token
AZURE_STORAGE_CONTAINER_NAME=your_container_name
```

### 8.6 Development Workflow Recommendation

1. **Phase 1: Backend Setup**
   - Initialize Express server
   - Configure database connection (Azure SQL)
   - Set up environment variables
   - Create basic API structure

2. **Phase 2: Authentication**
   - Implement OAuth strategies (Passport.js)
   - Set up JWT generation/validation
   - Create authentication middleware
   - Implement session persistence

3. **Phase 3: Database Integration**
   - Create user service layer
   - Implement organization management
   - Connect to existing SQL functions
   - Auto-assign free_trial plan

4. **Phase 4: Features**
   - Email integration (EmailJS)
   - Invitation system
   - VirusTotal integration
   - File upload handling

5. **Phase 5: Frontend-Backend Integration**
   - Update frontend services to call backend APIs
   - Replace mock data with real API calls
   - Implement error handling
   - Add loading states

6. **Phase 6: Testing & Deployment**
   - Test all OAuth flows
   - Test database operations
   - Security audit
   - Production deployment preparation

---

## Final Summary

The final deliverable should include:

- ✅ A solid enterprise-grade authentication system
- ✅ Fully functional SQL database integration
- ✅ Operational contact form
- ✅ Login notification system
- ✅ Complete invitation workflow
- ✅ VirusTotal file scanning integrated into the upload process

Everything must be implemented in a stable manner and prepared for future extensions such as paid plans and advanced account features.

---

## Additional Notes

- The frontend is production-ready and well-structured
- The database schema is complete with stored procedures and functions
- All credentials are available and ready for integration (will be provided separately)
- The developer should focus on backend implementation and API integration
- Consider using TypeScript for better type safety (optional but recommended)
- Implement proper error handling and logging throughout the application
- Add API documentation (Swagger/OpenAPI) for future maintenance

