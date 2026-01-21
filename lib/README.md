# Lib Directory

Shared library code used across multiple features. This is where you put truly reusable utilities, helpers, and services.

## Structure

```
lib/
  api/              # API client, interceptors, request/response handling
  storage/          # Secure storage utilities (tokens, user data)
  validation/       # Schema validation utilities
  utils/            # General utility functions
  errors/           # Error handling and custom error classes
  analytics/        # Analytics tracking utilities
  logging/          # Logging service
```

## Guidelines

- Code here should be feature-agnostic
- Prefer putting feature-specific code in the feature's directory
- Document exported functions with JSDoc comments
- Write unit tests for utility functions
