# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Build & Development Commands

### Core Commands

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm preview` - Build and start production server

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm check` - Run both lint and typecheck (recommended before commits)
- `pnpm format:check` - Check Prettier formatting
- `pnpm format:write` - Apply Prettier formatting

### Testing

This project doesn't have explicit test commands configured. Check for test files or ask the user for test commands.

## Project Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom theme
- **UI Components**: Radix UI primitives with shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query + tRPC
- **Package Manager**: pnpm

### Directory Structure

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
├── server/          # Backend code (tRPC routers)
├── styles/          # Global CSS
└── trpc/           # tRPC configuration
```

### Path Aliases

- `@/*` maps to `./src/*`

## Code Style Guidelines

### TypeScript Configuration

- Strict mode enabled with `noUncheckedIndexedAccess`
- Verbatim module syntax (`verbatimModuleSyntax`)
- ES2022 target with ESNext modules
- Prefer type imports over value imports

### Import Style

```typescript
// External libraries first
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

// Internal imports with @ alias
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### ESLint Rules

- Use inline type imports: `import type { ComponentProps } from "react"`
- Unused variables with `_` prefix are allowed
- Consistent type definitions enforced
- No unused await expressions

### Component Patterns

#### UI Components (shadcn/ui style)

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        // ...
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ComponentProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof componentVariants> {
  asChild?: boolean
}

function Component({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(componentVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Component, componentVariants }
```

#### Utility Functions

- Use `cn()` helper for conditional classes with `clsx` and `tailwind-merge`
- Export pure functions without side effects
- Type all parameters and return values

### Styling Guidelines

#### Tailwind CSS v4

- Use CSS custom properties for theming
- Follow the established color system with semantic tokens
- Use `@theme` for custom design tokens
- Dark mode via `.dark` class selector

#### Component Styling

- Prefer compound variants for complex state styling
- Use semantic color tokens (primary, secondary, muted, etc.)
- Follow the established radius scale: `--radius-sm`, `--radius-md`, etc.
- Use focus ring utilities: `focus-visible:ring-ring/50`

### Form Handling

- Use React Hook Form with Zod schemas
- Leverage `@hookform/resolvers` for validation
- Use controlled components with proper error handling
- Implement loading states for async operations

### State Management

- Use TanStack Query for server state
- tRPC for type-safe API calls
- Local state with React hooks (useState, useReducer)
- Context for global app state when needed

### Error Handling

- Use try-catch blocks for async operations
- Implement proper error boundaries
- Use toast notifications (Sonner) for user feedback
- Log errors appropriately without exposing sensitive data

### File Naming

- Components: PascalCase (e.g., `Button.tsx`, `DataTable.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useLocalStorage.ts`)
- Types: camelCase with `type` suffix if needed (e.g., `userTypes.ts`)

### Best Practices

- Always run `pnpm check` before committing
- Use semantic HTML elements
- Implement proper accessibility (ARIA labels, keyboard navigation)
- Add loading states and error handling
- Use React.memo for expensive components when needed
- Prefer composition over inheritance
- Keep components small and focused

### tRPC Patterns

- Define routers in `src/server/api/routers/`
- Use Zod for input validation
- Implement proper error handling in procedures
- Use type-safe client queries in components

### Performance Considerations

- Use Next.js Image optimization
- Implement code splitting for large components
- Use React.lazy() for route-level splitting
- Optimize bundle size with dynamic imports
- Use proper caching strategies for API calls
