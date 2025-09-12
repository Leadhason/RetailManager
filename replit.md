# EDMAX E-Commerce Management Software

## Overview

EDMAX is a comprehensive e-commerce management platform designed for building and power technology store owners. The system provides a complete administrative dashboard for managing products, orders, customers, inventory, and business analytics. Built as a full-stack application with React frontend and Express backend, it delivers a modern, scalable solution for e-commerce operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React 18 and TypeScript, using a component-based architecture with modern patterns:
- **UI Framework**: Radix UI components with Tailwind CSS styling and Shadcn/UI component library
- **State Management**: TanStack Query for server state management and React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
The server follows a RESTful API design built on Node.js with Express:
- **Framework**: Express.js with TypeScript for type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with role-based access control
- **API Structure**: Modular route handlers with middleware for authentication and authorization
- **File Organization**: Separation of concerns with dedicated services for auth and email

### Data Storage Architecture
PostgreSQL database with Drizzle ORM providing:
- **Schema Definition**: Centralized schema definitions in TypeScript
- **Migration System**: Database migrations managed through Drizzle Kit
- **Connection**: Neon serverless PostgreSQL for cloud deployment
- **Data Models**: Comprehensive schemas for users, products, orders, customers, suppliers, inventory, and analytics

### Authentication & Authorization
Multi-layered security system:
- **JWT Tokens**: Stateless authentication with 24-hour expiration
- **Role-Based Access**: Four permission levels (super_admin, store_manager, staff, view_only)
- **Password Security**: BCrypt hashing for secure password storage
- **Session Management**: Token-based sessions with automatic logout
- **Protected Routes**: Frontend route guards and backend middleware protection

### Component Architecture
Modular frontend structure with reusable components:
- **Layout System**: Main layout with responsive sidebar navigation and header
- **Feature Components**: Domain-specific components for products, orders, customers, etc.
- **UI Components**: Reusable Radix UI-based components with consistent styling
- **Form Components**: Validated form components with error handling
- **Data Tables**: Sortable, filterable tables with pagination support

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: TypeScript ORM with PostgreSQL dialect support

### Email Services
- **SendGrid**: Email delivery service for transactional emails and marketing campaigns
- **Email Templates**: Dynamic template support for order confirmations and notifications

### UI & Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Shadcn/UI**: Pre-built component library based on Radix UI and Tailwind

### Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast bundler for production builds

### Chart & Analytics
- **Recharts**: React-based charting library for dashboard analytics
- **TanStack Query**: Server state management with caching and background updates

### Authentication & Security
- **JSON Web Tokens**: Stateless authentication tokens
- **BCrypt**: Password hashing and verification
- **CORS**: Cross-origin request handling

### Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Development Environment
- **Replit**: Cloud development environment with hot reloading
- **Node.js**: JavaScript runtime for server-side execution
- **PostCSS**: CSS processing with Tailwind CSS integration