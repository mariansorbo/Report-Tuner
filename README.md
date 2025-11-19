# Report Tuner

A web application for managing Power BI reports with enterprise-grade authentication and file management.

## 🚀 Features

- **Multi-Provider OAuth Authentication**: LinkedIn, Google Workspace, Azure AD, and Auth0
- **Organization Management**: Create and manage teams with role-based access
- **File Upload & Scanning**: Secure .pbit file uploads with VirusTotal integration
- **Invitation System**: Invite team members to organizations
- **Email Notifications**: Contact form and login notifications via EmailJS

## 📋 Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **Vite 7.2.2** - Build tool and dev server
- **React Context API** - State management
- **CSS3** - Component-based styling

### Backend (To be implemented)
- **Node.js + Express** (recommended)
- **Azure SQL Database** - Data persistence
- **JWT** - Session management
- **Passport.js** - OAuth authentication

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Azure SQL Database access
- OAuth credentials (LinkedIn, Google, Azure AD, Auth0)
- EmailJS account
- VirusTotal API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Empower-Reports
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.jsx
│   ├── FileUpload.jsx
│   └── ...
├── contexts/           # React Context providers
│   ├── AuthContext.jsx
│   └── OrganizationContext.jsx
├── hooks/              # Custom React hooks
├── services/           # Service layer
│   ├── emailService.js
│   ├── virusTotalService.js
│   └── ...
└── App.jsx             # Main application
```

## 🔐 Environment Variables

See `env.example` for all required environment variables. Key variables include:

- Database connection string
- OAuth credentials (LinkedIn, Google, Azure AD, Auth0)
- EmailJS configuration
- JWT secret
- VirusTotal API key
- Azure Storage credentials

**⚠️ Important**: Never commit `.env` files to version control.

## 📚 Documentation

- **Technical Requirements**: See `TECHNICAL_REQUIREMENTS_PUBLIC.md` for detailed implementation requirements
- **Database Schema**: See `database/schema.sql` for database structure
- **API Documentation**: To be added after backend implementation

## 🐳 Docker Deployment

The project includes Docker configuration for production deployment:

```bash
docker build -t empower-reports .
docker run -p 80:80 empower-reports
```

## 🔒 Security

- All sensitive credentials are stored in environment variables
- JWT tokens for session management
- VirusTotal scanning for uploaded files
- HTTPS required in production

## 📝 License

[Your License Here]

## 👥 Contributing

[Contributing guidelines]

## 📧 Contact

[Contact information]
