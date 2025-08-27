# Overview

Alegra Time is a modern calendar-aware Pomodoro timer application that integrates with Google Calendar to provide smart timing recommendations and focus block creation. The application combines traditional Pomodoro technique with intelligent meeting detection to optimize productivity sessions. Users can track tasks with Pomodoro completion counters, receive smart timer adjustments to avoid conflicts with upcoming meetings, and automatically create calendar events for their focus sessions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with a modern React/TypeScript stack using Vite as the build tool. The application follows a component-based architecture with a clear separation of concerns:

- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with custom Alegra design tokens for consistent theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Component Library**: Custom components built on Radix UI primitives using the shadcn/ui pattern

The design implements a responsive layout with two main sections: a left sidebar containing daily progress and task management, and a right panel featuring the circular Pomodoro timer with tab navigation. The application adapts to mobile devices by stacking components vertically on screens smaller than 1024px.

## Backend Architecture

The backend follows a RESTful API design built on Express.js with TypeScript:

- **Server Framework**: Express.js with TypeScript for API endpoints
- **Session Management**: Express-session with in-memory storage for user sessions
- **File Structure**: Modular organization with separate files for routes, Google OAuth handling, calendar operations, and data storage
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

The API provides endpoints for authentication, task management, calendar integration, and focus block creation. The server implements a demo authentication system for easy testing while maintaining the structure for future full authentication systems.

## Data Storage Solutions

The application uses a hybrid storage approach designed for rapid prototyping while maintaining production readiness:

- **ORM**: Drizzle ORM with PostgreSQL schema definitions for type-safe database operations
- **Development Storage**: In-memory storage with demo data initialization for immediate functionality
- **Production Ready**: PostgreSQL schema ready for deployment with Neon Database integration
- **Token Storage**: Local JSON file storage for Google OAuth tokens with server-side management

The schema includes users, tasks, and focus blocks with proper relationships and constraints. The in-memory storage implementation provides a complete interface that can be easily swapped with a database implementation.

## Authentication and Authorization

The application implements Google OAuth 2.0 for calendar integration with a simplified authentication flow:

- **OAuth Flow**: Standard OAuth 2.0 authorization code flow with Google Calendar API
- **Scope Management**: Requests minimal necessary permissions (calendar.readonly and calendar.events)
- **Token Handling**: Server-side token storage and refresh management
- **Session Security**: HTTP-only sessions with configurable security settings
- **Demo Mode**: Simplified login system for development and testing

The OAuth implementation includes proper error handling, token refresh logic, and secure credential management through environment variables.

## External Dependencies

The architecture integrates several key external services and libraries:

- **Google Calendar API**: Official googleapis client for calendar read/write operations
- **Calendar Integration**: Real-time event fetching with caching to minimize API calls
- **Smart Features**: Meeting detection algorithms that analyze upcoming events to suggest timer adjustments
- **Focus Block Creation**: Automatic calendar event creation for Pomodoro sessions

The application caches calendar data for 60 seconds to balance real-time accuracy with API rate limits. Smart adjustment algorithms ensure Pomodoro sessions finish at least 3 minutes before scheduled meetings.