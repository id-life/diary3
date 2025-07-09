# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Architecture

This is a Next.js 15 diary/habit tracking application with the following key architectural patterns:

### State Management
- **Redux Toolkit** with persistence via `redux-persist` for main application state
- **Jotai** for additional state management needs
- **React Query** for server state management
- State is persisted to localStorage with the key `persist:diary`

### Core Data Models
- **Entry Types**: Habit/task definitions that users can create
- **Entry Instances**: Individual completions of entry types on specific dates
- **Reminder Records**: Scheduled reminders for entries
- **Login User**: User authentication and GitHub integration state

### GitHub Integration
- Users can backup their data to GitHub repositories
- State is saved as JSON files with timestamps
- OAuth authentication with GitHub for user management
- Backup functionality in `src/utils/GithubStorage.ts`

### UI Architecture
- **Next.js App Router** with pages in `src/app/`
- **Tailwind CSS** for styling
- **Ant Design** components alongside custom UI components
- **Framer Motion** for animations
- Custom theme system with light/dark mode support

### Key Directories
- `src/entry/` - Redux slices and store configuration
- `src/atoms/` - Jotai atoms
- `src/components/` - Reusable UI components organized by feature
- `src/api/` - API layer for GitHub and authentication
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions including GitHub storage

### Development Notes
- Uses `pnpm` as package manager
- Husky and lint-staged configured for pre-commit hooks
- Million.js integration for React performance optimization (currently disabled)
- Custom SVG handling via @svgr/webpack for component imports
- React strict mode is disabled in Next.js config

### Testing
- Jest and React Testing Library are configured but test commands are not in package.json scripts