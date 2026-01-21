# How Your Starter Kit Works 🎯

## Understanding the Architecture

Your starter kit is **infrastructure-first**, not a complete app. Think of it as a **professional toolbox** rather than a finished product.

## What You See vs. What You Have

### ✅ What's Built (Infrastructure)
- Complete auth system with hooks and guards
- 8 production-ready UI components
- API client with auto-retry and token refresh
- Error handling and logging
- Analytics tracking
- Privacy management
- Testing setup
- CI/CD pipelines

### 📱 What You See (Default Screens)
The app currently shows the **default Expo screens** because this is YOUR starter kit. You decide what screens to add based on your app's needs.

## How to Use It

### Option 1: See the Demo (Quickest)

1. Run your app: `npm start`
2. Click the **"Demo"** tab (newly added)
3. See all components working!

### Option 2: Add Auth Screens (When You Need Authentication)

The auth screens exist as ready-to-use templates in `features/auth/screens/`:

```
features/auth/screens/
  ├── login-screen.tsx       # Ready to use
  ├── register-screen.tsx    # Ready to use
  └── forgot-password-screen.tsx  # Ready to use
```

**To add auth to your app:**

1. Create an auth route group in your app:
```bash
mkdir app/(auth)
```

2. Add the auth screens:

```typescript
// app/(auth)/login.tsx
import { LoginScreen } from '@/features/auth';
export default LoginScreen;

// app/(auth)/register.tsx
import { RegisterScreen } from '@/features/auth';
export default RegisterScreen;
```

3. Use auth guards on your protected routes:

```typescript
// app/(tabs)/_layout.tsx
import { ProtectedRoute } from '@/features/auth';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs>
        {/* Your tabs */}
      </Tabs>
    </ProtectedRoute>
  );
}
```

### Option 3: Replace Default Screens (Start Fresh)

Replace the default Expo content with your own:

```typescript
// app/(tabs)/index.tsx
import { View } from 'react-native';
import { Text, Button, Card } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Card>
        <Text variant="h1">My App</Text>
        <Text variant="body">Welcome {user?.name || 'Guest'}!</Text>
        <Button variant="primary" onPress={() => {}}>
          Get Started
        </Button>
      </Card>
    </View>
  );
}
```

## Why This Design?

### ✅ Flexibility
You're not forced into a specific app structure. Use what you need, when you need it.

### ✅ Clean Slate
The default Expo screens let you verify everything works before you start customizing.

### ✅ Templates, Not Constraints
All components and screens are templates you can modify or replace.

### ✅ Learn As You Go
You can see how everything is built and adapt it to your needs.

## What's Available Right Now

### UI Components (Already Working!)
```typescript
import { 
  Button,      // 5 variants: primary, secondary, outline, ghost, danger
  Text,        // 8 variants: h1-h4, body, bodyLarge, caption, overline
  Input,       // With validation, labels, icons
  Card,        // 3 variants: elevated, outlined, filled
  Modal,       // 4 sizes: sm, md, lg, full
  Toast,       // 4 types: success, error, warning, info
  Loader,      // With fullScreen option
  EmptyState,  // With icon, action button
} from '@/components/ui';
```

### Features (Ready to Use!)
```typescript
// Authentication
import { useAuth } from '@/features/auth';
const { login, logout, user, isAuthenticated } = useAuth();

// API Calls
import { apiClient } from '@/lib/api/client';
const data = await apiClient.get('/users');

// Logging
import { logger } from '@/lib/logging/logger';
logger.info('User action', { userId: user.id });

// Analytics
import { analytics } from '@/lib/analytics/analytics';
analytics.track('button_clicked', { button: 'signup' });

// Theme
import { useTheme } from '@/theme';
const theme = useTheme(); // Auto switches light/dark
```

## Quick Start Checklist

- [x] ✅ Run `npm install` (fixed!)
- [x] ✅ Run `npm start`
- [x] ✅ Click "Demo" tab to see components
- [ ] 📝 Replace `app/(tabs)/index.tsx` with your content
- [ ] 🎨 Customize theme in `theme/tokens.ts`
- [ ] 🔐 Add auth screens if needed (optional)
- [ ] 🌐 Connect API in `config/env.ts`
- [ ] 🎯 Start building your features!

## Common Questions

### Q: Why don't I see the auth screens?
**A:** They're templates in `features/auth/screens/`. Add them to your routes when you need authentication.

### Q: Where are all the components?
**A:** Check the **Demo** tab! It showcases everything.

### Q: Can I modify the components?
**A:** Absolutely! They're yours to customize. They're in `components/ui/`.

### Q: Do I have to use everything?
**A:** No! Use what you need. It's a toolkit, not a framework.

### Q: Where's my data?
**A:** Connect your API in `config/env.ts` and use `apiClient` to make calls.

## Next Steps

1. **Explore the Demo tab** - See all components in action
2. **Read GET_STARTED.md** - Detailed setup guide
3. **Check QUICK_REFERENCE.md** - Syntax cheat sheet
4. **Build your first feature** - Use the components to create your screens!

## Example: Building Your First Screen

Here's a complete example:

```typescript
// app/(tabs)/profile.tsx
import { ScrollView, View } from 'react-native';
import { Text, Card, Button, Input } from '@/components/ui';
import { useTheme } from '@/theme';
import { useAuth } from '@/features/auth';
import { useState } from 'react';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing[4] }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h2" style={{ marginBottom: theme.spacing[4] }}>
            Profile
          </Text>
          
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            containerStyle={{ marginBottom: theme.spacing[3] }}
          />
          
          <Button variant="primary" fullWidth>
            Save Changes
          </Button>
        </Card>

        <Card variant="outlined">
          <Button 
            variant="danger" 
            fullWidth 
            onPress={logout}
          >
            Sign Out
          </Button>
        </Card>
      </View>
    </ScrollView>
  );
}
```

That's it! You now understand how your starter kit works. **Check the Demo tab to see it in action!** 🚀
