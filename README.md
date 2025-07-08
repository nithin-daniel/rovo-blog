# Modern Blog Application

A full-stack blog application built with TypeScript, React, and Node.js following clean architecture principles.

## 🚀 Project Status

This is a **work-in-progress** modern blog application with a solid foundation. The project structure is established with core functionality partially implemented.

### ✅ Completed Features
- **Authentication System**: Login/Register pages with JWT integration
- **Basic UI Components**: Buttons, Loading spinners, Post cards
- **Routing Setup**: React Router with protected routes
- **State Management**: Zustand stores for auth and theme
- **Project Structure**: Clean architecture with client/server separation
- **TypeScript Types**: Comprehensive type definitions
- **Development Setup**: Vite, ESLint, and development scripts

### 🚧 In Development
- **Post Management**: Create, Edit, Delete posts (pages exist in routing but need implementation)
- **Dashboard**: User dashboard for managing posts
- **Search & Filtering**: Advanced search functionality
- **User Profiles**: User profile pages and management
- **Categories & Tags**: Content organization system
- **Comments System**: Post commenting functionality

### 📋 Planned Features
- **Rich Text Editor**: Advanced content creation
- **Image Upload**: File management with Cloudinary
- **Real-time Features**: Live notifications and updates
- **Email System**: Notifications and verification
- **Admin Panel**: Content moderation and analytics
- **SEO Optimization**: Meta tags and social sharing
- **Mobile Responsive**: Full mobile optimization

## 🏗️ Architecture

This application follows Clean Architecture principles with clear separation of concerns:

```
modern-blog-app/
├── client/                 # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Common/     # Shared components (Button, Spinner, etc.)
│   │   │   ├── Layout/     # Layout components (Header, Footer)
│   │   │   └── Post/       # Post-related components
│   │   ├── pages/          # Page Components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── PostDetailPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/       # API Services
│   │   ├── store/          # Zustand State Management
│   │   └── types/          # TypeScript Type Definitions
├── server/                 # Node.js Backend (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/    # HTTP Request Controllers
│   │   ├── services/       # Business Logic Layer
│   │   ├── repositories/   # Data Access Layer
│   │   ├── models/         # Database Models (Mongoose)
│   │   ├── middleware/     # Express Middleware
│   │   ├── routes/         # API Route Definitions
│   │   ├── config/         # Database and Redis configuration
│   │   └── utils/          # Utility functions
└── shared/                 # Shared Types & Utilities
    └── types/              # Common TypeScript interfaces
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **React Query** for server state management
- **Zustand** for client state management
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express framework
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Cloudinary** for image management
- **Nodemailer** for email services
- **Redis** for caching
- **Joi** for validation

### Development Tools
- **Concurrently** for running multiple scripts
- **Nodemon** for development server
- **Jest** for testing
- **ESLint** and **Prettier** for code quality

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis (optional, for caching)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd modern-blog-app
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `.env` file in the server directory based on `server/.env.example`:
```bash
cp server/.env.example server/.env
```

Configure the following variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/blog_app

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL
CLIENT_URL=http://localhost:3000
```

4. **Start development servers**
```bash
npm run dev
```

This will start:
- Client development server on `http://localhost:3000`
- Server development server on `http://localhost:5000`

### Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run client:dev       # Start only client
npm run server:dev       # Start only server

# Building
npm run build           # Build both client and server
npm run client:build    # Build only client
npm run server:build    # Build only server

# Testing
npm test               # Run all tests
npm run client:test    # Run client tests
npm run server:test    # Run server tests

# Installation
npm run install:all    # Install dependencies for all packages
```

## 📁 Project Structure Details

### Client Structure
```
client/src/
├── components/
│   ├── Auth/           # ProtectedRoute component
│   ├── Common/         # Button, LoadingSpinner, SearchBar
│   ├── Layout/         # Header, Footer, Layout wrapper
│   └── Post/           # PostCard component
├── pages/              # Main page components
├── services/           # API service functions
├── store/              # Zustand state stores
└── App.tsx            # Main application component
```

### Server Structure
```
server/src/
├── controllers/        # Request/Response handling
├── services/          # Business logic
├── repositories/      # Database operations
├── models/           # Mongoose schemas
├── middleware/       # Express middleware
├── routes/           # API route definitions
├── config/           # Database and Redis setup
└── utils/            # Helper functions
```

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Git Workflow
1. Create feature branches from `main`
2. Use conventional commit messages
3. Ensure tests pass before committing
4. Create pull requests for code review

### Testing
- Write unit tests for utility functions
- Add integration tests for API endpoints
- Use React Testing Library for component tests

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB Atlas or local MongoDB
2. Configure Redis (optional but recommended)
3. Set up Cloudinary account for image uploads
4. Configure email service (Gmail, SendGrid, etc.)

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
cd server && npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Priorities
1. **Complete missing pages** (CreatePost, EditPost, Dashboard, Search, Profile)
2. **Implement server controllers and services**
3. **Add comprehensive testing**
4. **Improve UI/UX design**
5. **Add real-time features**

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Posts Endpoints
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:slug` - Get post by slug
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated)
- `DELETE /api/posts/:id` - Delete post (authenticated)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help with setup, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Join our community discussions

---

**Note**: This project is actively under development. Features and documentation may change as the project evolves.