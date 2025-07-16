# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Architecture

This is a Next.js 15 diary/habit tracking application for personal habit tracking and data management.

### Core Application Pages

- `/` - Home redirect to setting page
- `/add` - Create/edit entry types and habits
- `/entry` - View and analyze entry data with charts
- `/reminder` - Manage scheduled reminders
- `/settings` - Authentication, data export, and app configuration

### State Management Architecture

The application is currently in transition from localStorage-dependent to database-first architecture:

#### Current State (Hybrid)

- **Jotai atoms** as primary state management (`src/atoms/`)
- **localStorage sync** via `atomWithStorage` for persistence
- **Database backup** via GitHub OAuth API (`src/api/github.ts`)
- **Redux Toolkit** (legacy, being phased out)

#### Database-First Implementation

- **Memory-first atoms** in `src/atoms/databaseFirst.ts`
- **localStorage export utilities** in `src/utils/localStorageExport.ts`
- **Export UI** in `src/components/data/DataExportDialog.tsx`
- **Migration hooks** in `src/hooks/useDataExport.ts`

### Core Data Models

#### EntryType

Habit/task definitions with:

- `id`, `title`, `defaultPoints`, `pointStep`
- `routine`: Daily/Weekly/Monthly/Adhoc
- `themeColors`: Visual customization
- `createdAt`/`updatedAt` timestamps

#### EntryInstance

Individual completions of entry types:

- Links to `entryTypeId`
- `createdAt` determines the date
- `points` and `notes` for that completion
- Organized by date string in `entryInstancesMap`

#### ReminderRecord

Scheduled reminders for habits:

- Associated with specific entry types
- Configurable timing and frequency

### Authentication & Data Flow

- **GitHub OAuth** for user authentication (`src/hooks/useGitHubOAuth.ts`)
- **Cloud backup** via authenticated API endpoints
- **localStorage export** for database migration
- **Data validation** ensures integrity during transfers

### Key Architectural Patterns

#### Jotai Atom Structure

```typescript
// Storage-backed atoms (current)
atomWithStorage<DataType>('localStorage.key', defaultValue)

// Database-first atoms (new)
hybridAtom that works with/without localStorage sync
```

#### Data Export System

- **Database-ready JSON** format compatible with backup API
- **Copy-to-clipboard** for manual database entry
- **File download** for offline storage
- **Direct API save** for authenticated users

#### Component Organization

- `src/components/` organized by feature (entry, reminder, auth, data)
- Reusable UI components in subdirectories
- Jotai atoms imported at component level

### Development Workflow

#### State Management Migration

1. **Current atoms** use `atomWithStorage` for localStorage persistence
2. **New hybrid atoms** can work with or without localStorage
3. **Migration path**: localStorage → memory atoms → database-first
4. **Export tools** enable smooth transition between storage backends

#### Data Export Process

```typescript
// Export current state for database migration
const { copyToDatabaseString, saveToDatabase } = useDataExport();
await copyToDatabaseString(); // Copy JSON string
await saveToDatabase(); // Direct API save
```

#### Testing Data Scenarios

- **localStorage mode**: Default behavior with persistent storage
- **Database-only mode**: Pure memory atoms, no localStorage dependency
- **Export validation**: Ensures data integrity before migration

### GitHub Integration

- **OAuth flow** for user authentication
- **Backup API** at `/github-backups` endpoint
- **Data format** compatible with both Redux persist and new Jotai structure
- **Restore functionality** handles old and new backup formats

### Key Files for Understanding

- `src/entry/types-constants.ts` - Core data model definitions
- `src/atoms/index.ts` - Main Jotai atom exports
- `src/utils/localStorageExport.ts` - Database migration utilities
- `src/hooks/useDataExport.ts` - Export functionality
- `LOCALSTORAGE_DECOUPLING_GUIDE.md` - Complete migration strategy

### Development Notes

- Uses `pnpm` as package manager
- Husky and lint-staged configured for pre-commit hooks
- Million.js integration for React performance optimization (currently disabled)
- Custom SVG handling via @svgr/webpack for component imports
- React strict mode is disabled in Next.js config

### Migration Status

The codebase is actively transitioning from localStorage-dependent to database-first architecture. Key migration tools are implemented and functional. See `LOCALSTORAGE_DECOUPLING_GUIDE.md` for detailed migration strategy and `REFACTORING_PLAN.md` for implementation progress.
