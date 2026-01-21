# MyStart - Expo App Starter Kit

A comprehensive, production-ready starter kit for building React Native apps with Expo. This starter kit includes everything you need to quickly bootstrap a new mobile application with best practices built in.

## 🚀 Features

### 1. App Shell
- ✅ Environment configuration (dev/staging/production)
- ✅ Navigation structure with Expo Router
- ✅ Deep linking support
- ✅ Global state management with React Context
- ✅ Scalable feature/module folder structure

### 2. Design System
- ✅ Comprehensive theme system with design tokens
- ✅ Light and dark mode support
- ✅ Component library: Button, Text, Input, Card, Modal, Toast, Loader, EmptyState
- ✅ Consistent spacing, typography, and color system
- ✅ Icon system with SF Symbols

### 3. Authentication
- ✅ Email/password authentication hooks
- ✅ Social login structure (Google, Apple, Facebook)
- ✅ Secure token storage
- ✅ Session management with auto-refresh
- ✅ Auth guards for protected routes
- ✅ Ready-to-use login, register, and forgot password screens

### 4. Networking & Data
- ✅ API client with automatic auth token injection
- ✅ Token refresh on 401
- ✅ Retry logic for failed requests
- ✅ Request/response interceptors
- ✅ Typed models and validation schemas
- ✅ In-memory caching with TTL
- ✅ File upload/download helpers

### 5. Error Handling & Observability
- ✅ Global Error Boundary
- ✅ Logging system with levels (debug, info, warn, error)
- ✅ Sensitive data redaction in logs
- ✅ Crash reporting integration points (Sentry, Bugsnag)
- ✅ Analytics tracking with consistent event naming
- ✅ User identification and tracking

### 6. Quality & Delivery
- ✅ Testing setup with Jest
- ✅ ESLint configuration
- ✅ TypeScript with strict mode
- ✅ Pre-commit hooks with Husky
- ✅ CI/CD pipeline templates (GitHub Actions)
- ✅ Release workflow automation
- ✅ Version bump scripts
- ✅ Feature flags system

### 7. Compliance & Privacy
- ✅ Privacy-friendly defaults
- ✅ Consent management for GDPR/CCPA
- ✅ Data deletion pathways
- ✅ Data export functionality
- ✅ Accessibility utilities and helpers
- ✅ Privacy settings screen template

## 📁 Project Structure

```
├── app/                          # App screens (Expo Router)
│   ├── (tabs)/                   # Tab navigation
│   └── _layout.tsx               # Root layout
├── assets/                       # Static assets
├── components/                   # Reusable components
│   └── ui/                       # UI component library
├── config/                       # Environment & navigation config
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature
│   └── settings/                 # Settings feature
├── hooks/                        # Custom React hooks
├── lib/                          # Shared libraries
│   ├── api/                      # API client & utilities
│   ├── errors/                   # Error handling
│   ├── logging/                  # Logging service
│   ├── analytics/                # Analytics tracking
│   ├── storage/                  # Secure storage
│   ├── privacy/                  # Privacy & consent
│   ├── accessibility/            # Accessibility helpers
│   ├── validation/               # Validation schemas
│   └── feature-flags/            # Feature flags
├── store/                        # Global state management
├── theme/                        # Design system & theming
├── __tests__/                    # Test files
└── scripts/                      # Utility scripts
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

1. Clone or copy this starter kit
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on a platform:
   ```bash
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   npm run web      # Web browser
   ```

## 🔧 Configuration

### Environment Setup

Edit `config/env.ts` to configure your environments:

```typescript
const developmentConfig: EnvConfig = {
  env: 'development',
  apiUrl: 'http://localhost:3000/api',
  // ... other config
};
```

### API Integration

Update `lib/api/client.ts` to point to your backend API. The client already includes:
- Automatic auth token injection
- Token refresh on 401
- Retry logic
- Request/response interceptors

### Feature Flags

Manage features in `config/env.ts`:

```typescript
featureFlags: {
  newFeature: true,
  betaFeature: false,
}
```

Use in components:
```typescript
import { featureFlags } from '@/lib/feature-flags/flags';

if (featureFlags.isEnabled('newFeature')) {
  // Show new feature
}
```

## 🎨 Design System

The design system is built with:
- **Theme tokens**: Colors, spacing, typography, shadows
- **Light/Dark mode**: Automatic theme switching
- **UI Components**: Pre-built, themeable components

Example usage:
```typescript
import { useTheme } from '@/theme';
import { Button, Text, Card } from '@/components/ui';

const MyScreen = () => {
  const theme = useTheme();
  
  return (
    <Card>
      <Text variant="h2">Hello</Text>
      <Button variant="primary" onPress={handlePress}>
        Click me
      </Button>
    </Card>
  );
};
```

## 🔐 Authentication

Built-in auth system with:
- Login, Register, Forgot Password screens
- Auth guards for protected routes
- Secure token storage
- Auto token refresh

Example:
```typescript
import { useAuth } from '@/features/auth';

const MyScreen = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Your screen logic
};
```

Protected routes:
```typescript
import { ProtectedRoute } from '@/features/auth';

<ProtectedRoute>
  <YourProtectedScreen />
</ProtectedRoute>
```

## 📊 Analytics & Logging

Track events:
```typescript
import { analytics, AnalyticsEvents } from '@/lib/analytics/analytics';

analytics.track(AnalyticsEvents.BUTTON_CLICKED, {
  button_name: 'sign_up',
});
```

Log messages:
```typescript
import { logger } from '@/lib/logging/logger';

logger.info('User logged in', { userId: user.id });
logger.error('API error', { error });
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Write tests in `__tests__/` directory:
```typescript
import { render } from '@testing-library/react-native';
import { Button } from '@/components/ui/button';

test('renders button', () => {
  const { getByText } = render(<Button>Click me</Button>);
  expect(getByText('Click me')).toBeTruthy();
});
```

## 🚢 Deployment

### Version Bump

```bash
node scripts/bump-version.js patch  # 1.0.0 → 1.0.1
node scripts/bump-version.js minor  # 1.0.0 → 1.1.0
node scripts/bump-version.js major  # 1.0.0 → 2.0.0
```

### CI/CD

GitHub Actions workflows included:
- **ci.yml**: Runs on push/PR - linting, type checking, tests
- **release.yml**: Runs on tag push - creates release

### Release Process

1. Bump version: `node scripts/bump-version.js minor`
2. Commit: `git commit -am "chore: bump version to x.x.x"`
3. Tag: `git tag vx.x.x`
4. Push: `git push && git push --tags`

## 🔒 Privacy & Compliance

Built-in privacy features:
- Consent management (GDPR/CCPA)
- Data deletion pathways
- Data export functionality
- Privacy settings screen

Example:
```typescript
import { consentManager } from '@/lib/privacy/consent';

// Request consent
await consentManager.grantConsent('analytics');

// Check consent
if (consentManager.hasConsent('analytics')) {
  // Track analytics
}
```

## ♿ Accessibility

Accessibility helpers included:
```typescript
import { a11yProps } from '@/lib/accessibility/a11y';

<Button {...a11yProps.button('Submit form', 'Submits the registration form')}>
  Submit
</Button>
```

## 📚 Additional Resources

- [Development Guide](./DEVELOPMENT.md) - Detailed development guidelines
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

## 🤝 Contributing

When using this starter kit for your projects:

1. Update `app.json` with your app details
2. Configure your backend API in `config/env.ts`
3. Customize the theme in `theme/tokens.ts`
4. Add your features in the `features/` directory
5. Update this README with project-specific information

## 📝 License

This starter kit is provided as-is for your use. Customize and extend it for your needs.

## 🎯 Next Steps

1. **Update branding**: Customize colors, logos, and app name
2. **Connect backend**: Point API client to your backend
3. **Add features**: Build your app features in `features/` directory
4. **Setup services**: Configure analytics, crash reporting, etc.
5. **Test**: Write tests for your features
6. **Deploy**: Setup CI/CD and deploy to app stores

Happy coding! 🚀
