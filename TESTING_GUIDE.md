# Testing Guide 🧪

All dependencies are now installed! Here's how to test everything in your starter kit.

## 🚀 Quick Start

```bash
# Start the app
npm start

# Then press:
# - 'i' for iOS simulator
# - 'a' for Android emulator
# - 'w' for web browser
```

## 📱 Testing Features

### 1. **Demo Screen** (Main Testing Hub)
Navigate to the **Demo** tab to see all features in action!

### 2. **Haptic Feedback** ✅
- **Location**: Demo tab → "Haptic Feedback" card
- **Test**: Tap the Light/Medium/Heavy buttons
- **Test**: Tap Success/Warning/Error buttons
- **Test**: Tap "Selection Haptic" button
- **Expected**: Feel vibrations on physical devices (won't work on simulator)

### 3. **Share Functionality** ✅
- **Location**: Demo tab → "Share Functionality" card
- **Test**: Tap "Share Text" button
- **Test**: Pick an image first, then tap "Share Image"
- **Expected**: Native share sheet opens

### 4. **Clipboard Utilities** ✅
- **Location**: Demo tab → "Clipboard Utilities" card
- **Test**: Tap "Copy to Clipboard"
- **Test**: Tap "Paste from Clipboard"
- **Expected**: See copied text appear in the preview box

### 5. **Permissions Manager** ✅
- **Location**: Demo tab → "Permissions Manager" card
- **Test**: Tap "Request" for Camera, Media Library, Notifications, Location
- **Test**: Tap "Check" to see current status
- **Expected**: Permission dialogs appear, status updates

### 6. **Confirmation Dialogs** ✅
- **Location**: Demo tab → "Confirmation Dialogs" card
- **Test**: Tap "Show Confirmation Dialog"
- **Test**: Tap "Show Alert Dialog"
- **Expected**: Modal dialogs appear with buttons

### 7. **Push Notifications** ✅
- **Location**: Demo tab → "Push Notifications" card
- **Test**: Tap "Send Notification Now"
- **Test**: Tap "Schedule Notification (5s)"
- **Test**: Tap "Increment Badge"
- **Expected**: Notifications appear in system tray (best on physical device)

### 8. **Biometric Auth** ✅
- **Location**: Demo tab → "Biometric Auth" card
- **Test**: Tap "Authenticate" button
- **Expected**: Face ID/Touch ID prompt appears (physical device only)

### 9. **Image Picker** ✅
- **Location**: Demo tab → "Image Picker" card
- **Test**: Tap "Pick from Gallery"
- **Test**: Tap "Take Photo"
- **Expected**: Image picker/camera opens, avatar updates

### 10. **Network Status** ✅
- **Location**: Demo tab → "Network Status" card
- **Test**: Turn on Airplane Mode
- **Expected**: Offline banner appears at top of screen

### 11. **Form Management** ✅
- **Location**: Demo tab → "Form Management" card
- **Test**: Enter invalid email (e.g., "test")
- **Test**: Enter short password (e.g., "123")
- **Expected**: Validation errors appear after blur

### 12. **Animations** ✅
- **Location**: Demo tab → "Animations System" card
- **Test**: Scroll to see fade, slide, scale, pulse, float animations
- **Test**: Tap "Shake Me", "Wiggle Me" buttons
- **Expected**: Smooth animations play

### 13. **Interactive Tour** ✅
- **Location**: Demo tab → "Interactive App Tour" card
- **Test**: Tap "🚀 Start App Tour"
- **Expected**: Guided tour overlay appears with tooltips

### 14. **Date/Time Utils** ✅
- **Location**: Demo tab → "Date/Time Utils" card
- **Test**: View formatted dates and relative times
- **Expected**: See "2 hours ago", "Yesterday", etc.

### 15. **UI Components** ✅
- **Location**: Demo tab → Various cards
- **Test**: Tap buttons, open modals, use search bar
- **Test**: Open bottom sheet, see skeleton loaders
- **Expected**: All components work smoothly

## 🎯 Testing Checklist

### Core Features
- [ ] Haptic Feedback (physical device)
- [ ] Share Functionality
- [ ] Clipboard (copy/paste)
- [ ] Permissions (request/check)
- [ ] Confirmation Dialogs
- [ ] Push Notifications (physical device)
- [ ] Biometric Auth (physical device)
- [ ] Image Picker
- [ ] Network Status
- [ ] Form Validation
- [ ] Animations
- [ ] Interactive Tour
- [ ] Date/Time Utils

### UI Components
- [ ] Buttons (all variants)
- [ ] Inputs (with validation)
- [ ] Cards
- [ ] Modals
- [ ] Toast notifications
- [ ] Loader
- [ ] Empty State
- [ ] Avatar
- [ ] Bottom Sheet
- [ ] Search Bar
- [ ] Skeleton Loaders
- [ ] Feature Tooltips

### Utilities
- [ ] i18n (English/Norwegian switch)
- [ ] Theme (light/dark mode)
- [ ] Global State
- [ ] Error Handling
- [ ] Logging
- [ ] Analytics

## 📝 Notes

### Physical Device Required For:
- **Haptic Feedback** - Simulators don't support haptics
- **Push Notifications** - Best tested on real device
- **Biometric Auth** - Requires Face ID/Touch ID hardware
- **Camera** - Simulators have limited camera support

### Simulator/Emulator Works For:
- ✅ All UI components
- ✅ Form validation
- ✅ Animations
- ✅ Share (limited)
- ✅ Clipboard
- ✅ Permissions (dialogs appear)
- ✅ Network status
- ✅ Date/time utils
- ✅ Interactive tour

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Permissions not working
- Check that you're testing on a physical device or simulator with proper permissions
- Some permissions require app restart after granting

### Notifications not appearing
- Ensure you've granted notification permissions
- Best tested on physical device
- Check notification settings in device settings

### Haptics not working
- Only works on physical devices
- iOS: Requires iPhone 6s or later
- Android: Requires Android 8.0+

## 🎉 You're All Set!

Everything is installed and ready to test. Start with the Demo tab and explore all the features!

---

**Happy Testing!** 🚀
