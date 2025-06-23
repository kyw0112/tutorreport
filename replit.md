# replit.md

## Overview

This is a full-stack tutoring management application built with React, Express, and PostgreSQL. The system allows tutors to manage students and generate AI-powered daily reports about their tutoring sessions. The application features a modern, Korean-language interface designed for premium tutoring services.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Korean font support (Noto Sans KR)
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **AI Integration**: OpenAI API for automated report generation
- **Background Processing**: Custom batch queue system for AI tasks

### Data Flow
1. Users create students and daily reports through the React frontend
2. Form data is validated using Zod schemas shared between client and server
3. API requests are handled by Express routes with mock authentication
4. Database operations are performed using Drizzle ORM
5. AI report generation is queued for background processing
6. OpenAI API generates Korean-language reports based on lesson data
7. Real-time status updates are provided through polling

## Key Components

### Database Schema
- **Users**: Authentication and user management
- **Students**: Student profiles with grade, subject, and contact information
- **Daily Reports**: Lesson data, homework scores, and AI-generated reports
- **Batch Queue**: Background task management for AI processing

### API Structure
- `/api/students` - CRUD operations for student management
- `/api/reports` - Daily report creation and retrieval
- `/api/analytics/stats` - Dashboard statistics
- `/api/batch/status` - Background processing status

### Frontend Pages
- **Dashboard**: Overview with statistics and recent activities
- **Students**: Student management with card-based interface
- **Reports**: Daily report creation and viewing with AI status tracking
- **Analytics**: Performance metrics and progress tracking
- **Settings**: User preferences and system configuration

### Background Services
- **Batch Queue Service**: Processes AI report generation tasks
- **OpenAI Service**: Generates professional Korean reports for parents
- **Automatic Scheduling**: Periodic processing of queued tasks

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **openai**: AI report generation
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **react-hook-form**: Form management
- **zod**: Runtime type validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server
- **vite**: Frontend development server and bundling

## Deployment Strategy

### Development
- Uses Vite dev server for hot reloading
- tsx for server-side TypeScript execution
- Real-time error overlay for development debugging

### Production
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code for Node.js
- Database: Drizzle migrations for schema management
- Deployment: Configured for Replit autoscale deployment

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- OpenAI API key for AI report generation
- PostgreSQL 16 module configured in Replit

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```