# Version Checker Setup Guide

## Overview

The App Version Checker can automatically check for updates and show alerts when your app is outdated. By default, it's **disabled** for the starter kit, but you can easily enable it for production.

## Two Modes

### 1. **Manual Mode (Starter Kit Default)**
- User clicks button to check
- No automatic checking
- Perfect for development/starter kit

### 2. **Auto Mode (Production)**
- Automatically checks on app start
- Shows alert if update needed
- Perfect for production apps

## Setup for Production

### Option 1: Using the Provider Component (Recommended)

Add to your `app/_layout.tsx`:

```typescript
import { VersionCheckerProvider } from '@/lib/app-version';

export default function RootLayout() {
  return (
    <VersionCheckerProvider
      apiUrl="https://your-api.com/api/version" // Your API endpoint
      autoCheckOnMount={true}  // Check when app starts
      autoShowAlert={true}      // Show alert if outdated
      checkInterval={24 * 60 * 60 * 1000} // Check every 24 hours
    >
      {/* Your app content */}
    </VersionCheckerProvider>
  );
}
```

### Option 2: Using the Hook

In your root component:

```typescript
import { useVersionCheckerOnMount } from '@/lib/app-version';

export default function App() {
  useVersionCheckerOnMount({
    apiUrl: 'https://your-api.com/api/version',
    autoCheckOnMount: true,
    autoShowAlert: true,
  });

  return (
    // Your app
  );
}
```

### Option 3: Manual Initialization

```typescript
import { initVersionChecker } from '@/lib/app-version';

// In your app initialization
initVersionChecker({
  apiUrl: 'https://your-api.com/api/version',
  autoCheckOnMount: true,
  autoShowAlert: true,
  checkInterval: 24 * 60 * 60 * 1000, // 24 hours
});
```

## API Endpoint Format

Your API should return JSON in this format:

```json
{
  "version": "1.2.3",
  "critical": false,
  "message": "Optional update message"
}
```

**Fields:**
- `version` (required): Latest version string (e.g., "1.2.3")
- `critical` (optional): If true, user cannot skip update
- `message` (optional): Custom message to show in alert

## Configuration Options

```typescript
interface AppVersionConfig {
  apiUrl?: string;              // Your API endpoint
  checkInterval?: number;        // How often to check (ms)
  autoCheckOnMount?: boolean;    // Check on app start
  autoShowAlert?: boolean;       // Show alert if outdated
  showAlertOnStartup?: boolean;  // Legacy option
  criticalVersion?: string;      // Minimum required version
  enabled?: boolean;            // Enable/disable checking
}
```

## Example: Production Setup

```typescript
// app/_layout.tsx
import { VersionCheckerProvider } from '@/lib/app-version';

export default function RootLayout() {
  const isProduction = process.env.EXPO_PUBLIC_ENV === 'production';

  return (
    <VersionCheckerProvider
      apiUrl={isProduction ? 'https://api.yourapp.com/version' : undefined}
      autoCheckOnMount={isProduction}
      autoShowAlert={isProduction}
      enabled={isProduction}
    >
      {/* Your app */}
    </VersionCheckerProvider>
  );
}
```

## Disable for Starter Kit

The version checker is **disabled by default** for the starter kit. To keep it disabled, simply don't add the provider or set:

```typescript
<VersionCheckerProvider
  autoCheckOnMount={false}
  autoShowAlert={false}
  enabled={false}
>
```

## Testing

1. **Manual Check**: Use the "Check for Updates" button in the demo
2. **Simulate Outdated**: Use the "Simulate Outdated App" button to see the alert
3. **Production**: Set `autoCheckOnMount: true` and provide a real API URL

## App Store URLs

The version checker automatically constructs app store URLs from your `app.json`:

- **iOS**: Uses `ios.bundleIdentifier`
- **Android**: Uses `android.package`

Make sure these are set correctly in your `app.json` or `app.config.js`.

## Notes

- Auto-checking is **disabled by default** for the starter kit
- You can enable it per environment (dev/staging/prod)
- The alert respects `critical` flag - critical updates cannot be skipped
- Version comparison uses semantic versioning (1.2.3 format)
