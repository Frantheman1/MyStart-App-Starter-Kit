# MyStart - Your Internal Expo App Starter Kit 🚀

A comprehensive, production-ready starter kit for building React Native apps with Expo. Everything you need to quickly bootstrap a new mobile application with best practices built in.

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm start
```

Then press `i` for iOS, `a` for Android, or `w` for web.

### 🎯 First Time Here?

1. **See it working**: Click the **"Demo"** tab to see all components in action
2. **Understand it**: Read [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) 
3. **Get started**: Read [GET_STARTED.md](./GET_STARTED.md) for setup

> 💡 **Note:** The app shows default Expo screens because this is a **starter kit**, not a finished app. The Demo tab showcases all the components you can use!

## ✨ What's Included

This starter kit provides 7 comprehensive areas, all ready to use:

### 1️⃣ App Shell
- ✅ Environment configuration (dev/staging/production)
- ✅ Navigation with Expo Router and deep linking
- ✅ Global state management
- ✅ Scalable folder structure

### 2️⃣ Design System
- ✅ Complete theme system (light & dark mode)
- ✅ 8 UI components: Button, Text, Input, Card, Modal, Toast, Loader, EmptyState
- ✅ Design tokens (colors, spacing, typography)
- ✅ Responsive and accessible

### 3️⃣ Authentication
- ✅ Email/password authentication
- ✅ Social login structure (Google, Apple, Facebook)
- ✅ Secure token storage
- ✅ Auto token refresh
- ✅ Auth guards for protected routes
- ✅ Pre-built login/register screens

### 4️⃣ Networking & Data
- ✅ Smart API client (auto auth, retry, timeout)
- ✅ In-memory caching
- ✅ Validation utilities
- ✅ File upload/download helpers

### 5️⃣ Error Handling & Observability
- ✅ Global error boundary
- ✅ Logging with sensitive data redaction
- ✅ Crash reporting integration (Sentry-ready)
- ✅ Analytics tracking

### 6️⃣ Quality & Delivery
- ✅ Testing setup (Jest)
- ✅ ESLint & TypeScript
- ✅ Pre-commit hooks
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Feature flags

### 7️⃣ Compliance & Privacy
- ✅ GDPR/CCPA consent management
- ✅ Data deletion pathways
- ✅ Privacy settings screen
- ✅ Accessibility helpers

## 📚 Documentation

- **[GET_STARTED.md](./GET_STARTED.md)** - Start here! Complete setup guide
- **[STARTER_KIT_README.md](./STARTER_KIT_README.md)** - Full feature documentation
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Cheat sheet for common patterns
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guidelines

## 🎨 Quick Example

```typescript
import { useTheme } from '@/theme';
import { Button, Text, Card } from '@/components/ui';
import { useAuth } from '@/features/auth';

function MyScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  
  return (
    <Card>
      <Text variant="h2">Welcome {user?.name}!</Text>
      <Button variant="primary" onPress={logout}>
        Sign Out
      </Button>
    </Card>
  );
}
```

## 🔧 Common Commands

```bash
# Development
npm start              # Start dev server
npm run ios            # Run on iOS
npm run android        # Run on Android

# Quality
npm run lint           # Lint code
npm run type-check     # Check TypeScript
npm test               # Run tests

# Version & Release
npm run bump:patch     # 1.0.0 → 1.0.1
npm run bump:minor     # 1.0.0 → 1.1.0
npm run bump:major     # 1.0.0 → 2.0.0
```

## 📁 Project Structure

```
├── app/                    # Screens (Expo Router)
├── components/ui/          # UI component library
├── config/                 # Environment config
├── features/               # Feature modules
│   ├── auth/              # Authentication
│   └── settings/          # Settings
├── lib/                    # Shared libraries
│   ├── api/               # API client
│   ├── errors/            # Error handling
│   ├── logging/           # Logging
│   ├── analytics/         # Analytics
│   ├── privacy/           # Privacy & consent
│   └── accessibility/     # Accessibility
├── store/                  # Global state
├── theme/                  # Design system
└── __tests__/             # Tests
```

## 🎯 Next Steps

1. **Read [GET_STARTED.md](./GET_STARTED.md)** for setup instructions
2. **Update `config/env.ts`** with your API URL
3. **Customize `theme/tokens.ts`** with your brand colors
4. **Start building features** in the `features/` directory

## 🌟 Key Features

- **Type-safe** - Full TypeScript support
- **Tested** - Jest setup included
- **Accessible** - WCAG 2.1 AA compliant components
- **Production-ready** - CI/CD, error tracking, analytics
- **Privacy-first** - GDPR/CCPA compliant
- **Maintainable** - Clean architecture, clear separation of concerns

## 📱 Supported Platforms

- ✅ iOS (13+)
- ✅ Android (API 21+)
- ✅ Web

## 🤝 Contributing

This is your internal starter kit. Customize it for your needs:

1. Update branding and theme
2. Add your common features
3. Configure your preferred services
4. Evolve it based on your learnings

## 📄 License

This starter kit is for your internal use. Customize freely!

---

**Built with ❤️ for fast, high-quality app development.**

Start building your next great app! 🚀
