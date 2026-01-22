# Advanced Features Guide 🚀

## Overview

Three advanced, production-ready features have been added to your starter kit:

1. **GPS Tracker / Geofencing** - Pokestop-like proximity detection
2. **Paywall / Trial System** - Usage tracking and trial management
3. **In-App Purchases / Subscriptions** - Monetization support

---

## 1. 📍 GPS Tracker / Geofencing

### Features
- **Geofencing**: Monitor regions and detect enter/exit events
- **Proximity Detection**: Pokestop-like "reach when close" functionality
- **Distance Calculations**: Real-time distance to locations
- **Background Monitoring**: Continuous location tracking
- **Multiple Geofences**: Track multiple locations simultaneously

### Files
- `lib/geofencing/geofencing.ts` - Geofencing service
- `lib/geofencing/proximity.ts` - Proximity detection

### Usage

#### Geofencing
```typescript
import { useGeofencing } from '@/lib/geofencing';

const { addGeofence, removeGeofence, geofences } = useGeofencing();

// Add a geofence
await addGeofence({
  id: 'location-1',
  latitude: 59.9139,
  longitude: 10.7522,
  radius: 100, // meters
  notifyOnEnter: true,
  notifyOnExit: true,
});

// Register callbacks
geofencingService.onEnter('location-1', (event) => {
  console.log('Entered geofence!', event);
});

geofencingService.onExit('location-1', (event) => {
  console.log('Exited geofence!', event);
});
```

#### Proximity Detection (Pokestop-like)
```typescript
import { useProximity } from '@/lib/geofencing';

const { checkProximity, nearbyLocations } = useProximity();

const locations = [
  {
    id: 'pokestop-1',
    name: 'Pokestop 1',
    latitude: 59.9139,
    longitude: 10.7522,
    radius: 50, // 50 meters
    onReach: () => {
      console.log('🎉 Reached pokestop!');
      // Trigger your action here
    },
  },
];

// Check proximity
const nearby = await checkProximity(locations, 50);
// Returns locations sorted by distance, with isReached flag
```

### Demo
- Get your location first
- Add geofence at current location
- Check proximity to demo locations
- See nearby locations with distances

---

## 2. ⏱️ Paywall / Trial System

### Features
- **Trial Tracking**: Automatically track app usage days
- **Trial Expiration**: Detect when trial expires
- **Paywall Component**: Beautiful subscription paywall
- **Persistent Storage**: Trial state saved securely
- **Auto-Paywall**: Show paywall when trial expires

### Files
- `lib/trial/trial.ts` - Trial management
- `components/ui/paywall.tsx` - Paywall component

### Usage

#### Basic Trial
```typescript
import { useTrial } from '@/lib/trial';
import { Paywall } from '@/components/ui';

function MyApp() {
  const {
    isTrialActive,
    daysRemaining,
    daysUsed,
    isExpired,
    shouldShowPaywall,
    resetTrial, // For testing
  } = useTrial({ trialDays: 3 });

  // Show paywall when trial expires
  if (shouldShowPaywall()) {
    return (
      <Paywall
        visible={true}
        onClose={() => {}}
        onSubscribe={handleSubscribe}
        trialDaysRemaining={daysRemaining}
      />
    );
  }

  return (
    <View>
      <Text>Trial: {daysRemaining} days remaining</Text>
      {/* Your app content */}
    </View>
  );
}
```

#### Trial Configuration
```typescript
const trial = useTrial({
  trialDays: 3, // 3-day trial
  storageKey: 'my_app_trial', // Optional custom key
});
```

### Paywall Component
```typescript
<Paywall
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onSubscribe={handleSubscribe}
  trialDaysRemaining={3}
  products={[
    {
      id: 'monthly',
      title: 'Monthly',
      description: 'Billed monthly',
      price: '$9.99/month',
      popular: false,
    },
    {
      id: 'yearly',
      title: 'Yearly',
      description: 'Save 20%',
      price: '$79.99/year',
      popular: true,
    },
  ]}
  title="Unlock Premium"
  subtitle="Get access to all features"
  features={[
    'Unlimited usage',
    'All premium features',
    'Ad-free experience',
  ]}
/>
```

### Demo
- See trial status (days remaining, days used)
- Show paywall button
- Reset trial for testing
- Paywall auto-shows when trial expires

---

## 3. 💰 In-App Purchases / Subscriptions

### Features
- **Product Fetching**: Get products from App Store / Play Store
- **Purchase Flow**: Handle purchase transactions
- **Restore Purchases**: Restore previous purchases
- **Purchase Status**: Track purchased products
- **RevenueCat Support**: Works with RevenueCat (recommended)
- **expo-iap Support**: Fallback to expo-iap

### Files
- `lib/purchases/purchases.ts` - Purchase service

### Setup

#### Option 1: RevenueCat (Recommended)
```bash
npm install react-native-purchases
```

Then initialize in your app:
```typescript
import Purchases from 'react-native-purchases';

// Initialize RevenueCat
await Purchases.configure({
  apiKey: 'your-revenuecat-api-key',
});
```

#### Option 2: expo-iap
```bash
npx expo install expo-iap
```

### Usage

```typescript
import { useInAppPurchase } from '@/lib/purchases';

const {
  products,
  isLoading,
  fetchProducts,
  purchaseProduct,
  restorePurchases,
  isPurchased,
} = useInAppPurchase();

// Fetch products
await fetchProducts(['monthly', 'yearly']);

// Purchase a product
const result = await purchaseProduct('monthly');
if (result.success) {
  console.log('Purchase successful!');
}

// Restore purchases
const restored = await restorePurchases();

// Check if purchased
if (isPurchased('monthly')) {
  // User has premium access
}
```

### Integration with Paywall
```typescript
const handleSubscribe = async (productId: string) => {
  const result = await purchaseProduct(productId);
  if (result.success) {
    // End trial
    endTrial();
    // Show success
    showToast({ message: 'Subscription successful!', type: 'success' });
  }
};
```

### Demo
- Fetch products button
- Restore purchases button
- Purchase individual products
- See purchase status

---

## Complete Integration Example

Here's how to use all three features together:

```typescript
import { useTrial } from '@/lib/trial';
import { useInAppPurchase } from '@/lib/purchases';
import { Paywall } from '@/components/ui';
import { useGeofencing } from '@/lib/geofencing';

function MyApp() {
  // Trial management
  const { shouldShowPaywall, daysRemaining } = useTrial({ trialDays: 3 });
  
  // Purchases
  const { purchaseProduct, isPurchased } = useInAppPurchase();
  
  // Geofencing
  const { addGeofence } = useGeofencing();

  // Show paywall if trial expired
  if (shouldShowPaywall() && !isPurchased('monthly')) {
    return (
      <Paywall
        visible={true}
        onSubscribe={async (productId) => {
          const result = await purchaseProduct(productId);
          if (result.success) {
            // User subscribed - grant access
          }
        }}
        trialDaysRemaining={daysRemaining}
      />
    );
  }

  // Your app content
  return (
    <View>
      {/* App content */}
    </View>
  );
}
```

---

## Configuration

### Geofencing
- Requires location permissions
- Uses `expo-location` (already installed)
- Background location for continuous monitoring

### Trial System
- Automatically tracks first launch date
- Stores trial state securely
- Configurable trial days
- Auto-expires based on date

### In-App Purchases
- **Recommended**: Use RevenueCat (`react-native-purchases`)
- **Alternative**: Use `expo-iap` for development builds
- Configure products in App Store Connect / Play Console
- Server-side receipt validation recommended for production

---

## Production Checklist

### Geofencing
- [ ] Request background location permissions
- [ ] Test on physical devices
- [ ] Optimize battery usage
- [ ] Handle permission denials gracefully

### Trial System
- [ ] Set appropriate trial days
- [ ] Test trial expiration
- [ ] Integrate with analytics
- [ ] Handle edge cases (app reinstall, etc.)

### In-App Purchases
- [ ] Set up RevenueCat account (recommended)
- [ ] Configure products in stores
- [ ] Test purchase flow
- [ ] Implement server-side validation
- [ ] Handle subscription status changes
- [ ] Test restore purchases

---

## Notes

- **Geofencing**: Works best on physical devices with GPS
- **Trial System**: Automatically initializes on first app launch
- **In-App Purchases**: RevenueCat is recommended for production apps
- **Paywall**: Fully customizable, works with any purchase system

---

## Testing

All features are showcased in the Demo tab:
- GPS Tracker: Add geofences, check proximity
- Trial System: See trial status, show paywall
- In-App Purchases: Fetch products, purchase, restore

---

**These features are production-ready and can be used immediately in your apps!** 🎉
