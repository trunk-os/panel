# Trunk Panel

A comprehensive system administration dashboard built with React, TypeScript, and Material UI. Provides an intuitive interface for managing users, ZFS storage, and monitoring system status.

## Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token storage
- Protected routes with authentication guards
- User session management with automatic token refresh
- First-time user onboarding flow

### 👥 User Management
- Complete user lifecycle management (create, read, update, delete)
- Advanced user search and filtering
- User profile management (username, email, phone, real name)
- Password management with confirmation validation
- Role-based access control

### 💾 ZFS Storage Management
- Comprehensive ZFS dataset and volume management
- Create datasets with optional quotas
- Create volumes with specified sizes
- Delete storage resources with confirmation dialogs
- Real-time storage usage monitoring
- Advanced filtering and search capabilities

### 📊 System Monitoring
- Real-time API status monitoring with auto-refresh
- System health indicators
- Disk, compute, and network metrics
- Responsive dashboard with collapsible sections

### 🎨 Modern UI/UX
- Material UI design system with consistent theming
- Dark/light theme toggle with system preference sync
- Responsive design optimized for desktop and mobile
- Loading states and comprehensive error handling
- Toast notifications for user feedback

## Technology Stack

### Core Technologies
- **React 19** with TypeScript for type-safe development
- **Material UI (MUI)** for component library and theming
- **React Router v7** with hash routing for client-side navigation
- **Zustand** for lightweight state management
- **Vite** for fast development and optimized builds
- **Bun** as package manager and JavaScript runtime

### Specialized Libraries
- **CBOR2** for efficient binary API communication
- **react-secure-storage** for secure token persistence
- **Biome** for fast linting and code formatting
- **Vitest** for unit testing with Happy DOM

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Node.js >= 18.0.0
- A running Trunk API server

## Quick Start

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd trunk/panel
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API server configuration
   ```

4. **Start development server**
   ```bash
   bun dev
   ```

5. **Open the application**
   - Navigate to http://localhost:3000
   - Login with existing credentials or create a new user

## Development Commands

```bash
# Development
bun dev              # Start development server with HMR
bun build           # Build for production
bun serve           # Serve production build locally

# Code Quality
bun typecheck       # TypeScript type checking
bun lint            # Lint code with Biome
bun format          # Format code with Biome

# Testing
bun test            # Run test suite
bun test --watch    # Run tests in watch mode
bun test --coverage # Run tests with coverage report
```

## Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Development Configuration (optional)
DEV_HOST=your-hostname  # For HMR on remote development
```

Variables prefixed with `VITE_` are exposed to the client-side application.

## Application Structure

```
src/
├── api/                    # API communication layer
│   ├── client.ts          # CBOR-based API client with authentication
│   ├── types.ts           # TypeScript type definitions
│   └── errors.ts          # Centralized error handling
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard with metrics
│   ├── LoginPage.tsx      # Authentication interface
│   ├── UserManagementPage.tsx  # User CRUD operations
│   ├── ZFSPage.tsx        # ZFS storage management
│   ├── Layout.tsx         # Application layout with navigation
│   ├── AuthGuard.tsx      # Route protection component
│   └── [various UI components]
├── store/                 # Zustand state stores
│   ├── authStore.ts       # Authentication state
│   ├── themeStore.ts      # Theme preferences
│   └── apiStatusStore.ts  # API connection status
├── hooks/                 # Custom React hooks (if any)
├── types/                 # Global TypeScript definitions
├── App.tsx               # Main application with routing
└── main.tsx              # Application entry point
```

## Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | User authentication (public) |
| `/dashboard` | Dashboard | System overview and metrics |
| `/users` | UserManagementPage | User management interface |
| `/users/:userId` | UserDetailsPage | Individual user details |
| `/zfs` | ZFSPage | ZFS storage management |

## API Integration

The application communicates with the Trunk API using CBOR (Concise Binary Object Representation) for efficient data transfer.

### API Endpoints

**Authentication:**
- `POST /session/login` - User authentication

**User Management:**
- `GET /users` - List all users
- `PUT /users` - Create new user
- `GET /user/:id` - Get user details
- `POST /user/:id` - Update user information
- `DELETE /user/:id` - Delete user account

**ZFS Management:**
- `POST /zfs/list` - List ZFS datasets and volumes
- `POST /zfs/create_dataset` - Create new dataset
- `POST /zfs/create_volume` - Create new volume
- `POST /zfs/destroy` - Delete dataset or volume

**System Status:**
- `GET /status/ping` - API health check

### Usage Example

```typescript
import { api } from '@/api/client';

// Fetch users
const users = await api.users.list();

// Create a new user
await api.users.create({
  username: 'newuser',
  password: 'securepassword',
  email: 'user@example.com'
});

// Create ZFS dataset
await api.zfs.createDataset({
  name: 'tank/dataset',
  quota: '10G'
});
```

## State Management

The application uses Zustand for state management with the following stores:

- **authStore**: User authentication, tokens, and session management (using react-secure-storage for persistance)
- **themeStore**: UI theme preferences and system theme detection
- **apiStatusStore**: API connection status and health monitoring

## Testing

Tests are written using Vitest with Happy DOM for browser environment simulation.

```bash
# Run all tests
bun test

# Watch mode for development
bun test --watch

# Generate coverage report
bun test --coverage
```

Test files are located in `__tests__` directories alongside the code they test.

## Contributing

1. **Code Style**: Follow the established patterns and use TypeScript strictly
2. **Testing**: Add tests for new features and ensure existing tests pass
3. **Linting**: Run `bun lint` and `bun typecheck` before committing
4. **Documentation**: Update documentation for significant changes

## Building for Production

```bash
# Build the application
bun run build

# The built files will be in the `dist/` directory
# Serve with any static file server
```

## Container Deployment

### Podman Build

1. **Configure production environment**
   ```bash
   # Create .env.production with your API server URL
   echo "VITE_API_BASE_URL=http://your-api-server:5309" > .env.production
   ```

2. **Build the container image**
   ```bash
   podman build -t trunk-admin .
   ```

3. **Run the container**
   ```bash
   # Run on port 8080
   podman run -d -p 8080:80 --name trunk-admin trunk-admin
   
   # Or with custom port
   podman run -d -p 3000:80 --name trunk-admin trunk-admin
   ```

4. **Access the application**
   - Navigate to http://localhost:8080 (or your configured port)

The container build process will:
- Use the `.env.production` file to configure the API base URL at build time
- Build the React application with production optimizations
- Serve the static files using a lightweight web server
