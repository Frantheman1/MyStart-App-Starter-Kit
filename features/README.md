# Features Directory

This directory contains feature modules organized by domain. Each feature is self-contained and follows a consistent structure.

## Structure

Each feature module should follow this structure:

```
features/
  feature-name/
    index.ts          # Public API exports
    types.ts          # TypeScript types/interfaces
    components/       # Feature-specific components
    hooks/            # Feature-specific hooks
    utils/            # Feature-specific utilities
    api.ts            # API calls for this feature (optional)
    screens/          # Screens/pages for this feature (optional)
```

## Example Features

- **auth/** - Authentication and user management
- **profile/** - User profile management
- **settings/** - App settings and preferences
- **notifications/** - Push notifications and in-app notifications
- **payments/** - Payment processing and subscriptions

## Guidelines

1. **Self-contained**: Each feature should be as independent as possible
2. **Clear exports**: Use index.ts to define the public API
3. **Shared code**: Put truly shared code in the root `/lib` or `/utils` directory
4. **Testing**: Include tests alongside feature code (e.g., `component.test.tsx`)

## Creating a New Feature

```bash
mkdir -p features/my-feature/{components,hooks,utils}
touch features/my-feature/{index.ts,types.ts}
```

Then implement your feature and export what's needed via `index.ts`.
