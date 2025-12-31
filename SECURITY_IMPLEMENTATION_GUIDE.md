# 🚀 Content Security - Quick Implementation Guide

**Date**: December 31, 2025  
**Estimated Time**: 2-3 hours

---

## 📋 Implementation Steps

### Step 1: Install Dependencies (5 minutes)

```powershell
cd frontend
npm install expo-file-system expo-blur react-native-webview
```

---

### Step 2: Wrap App with Screenshot Prevention (10 minutes)

**File**: `frontend/App.js`

```javascript
import ScreenshotPrevention from './src/components/ScreenshotPrevention';

export default function App() {
    return (
        <ScreenshotPrevention>
            {/* Your existing app content */}
            <NavigationContainer>
                {/* ... */}
            </NavigationContainer>
        </ScreenshotPrevention>
    );
}
```

---

### Step 3: Update NotesTab Component (30 minutes)

**File**: `frontend/src/components/NotesTab.js`

Replace the existing component with:

```javascript
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import SecurePDFViewer from './SecurePDFViewer';
import ContentService from '../services/contentService';
import { useAuth } from '../context/AuthContext';

export default function NotesTab({ topicId }) {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadNotes();
    }, [topicId]);

    const loadNotes = async () => {
        try {
            const response = await ContentService.getNotes(topicId);
            setPdfUrl(response.data.url);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SecurePDFViewer
            pdfUrl={pdfUrl}
            fileName={`topic-${topicId}-notes.pdf`}
            userId={user.id}
        />
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
```

---

### Step 4: Update MindMapTab Component (30 minutes)

**File**: `frontend/src/components/MindMapTab.js`

```javascript
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import SecureImageViewer from './SecureImageViewer';
import ContentService from '../services/contentService';
import { useAuth } from '../context/AuthContext';

export default function MindMapTab({ topicId }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadMindMap();
    }, [topicId]);

    const loadMindMap = async () => {
        try {
            const response = await ContentService.getMindMap(topicId);
            setImageUrl(response.data.url);
        } catch (error) {
            console.error('Error loading mind map:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SecureImageViewer
            imageUrl={imageUrl}
            fileName={`topic-${topicId}-mindmap.jpg`}
            userId={user.id}
        />
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
```

---

### Step 5: Update Logout Function (15 minutes)

**File**: `frontend/src/context/AuthContext.js` or wherever logout is handled

```javascript
import SecureStorage from '../utils/secureStorage';

const logout = async () => {
    try {
        // Clear secure files
        await SecureStorage.clearAllSecureFiles();
        
        // Clear auth tokens
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        
        // Call backend logout
        await AuthService.logout();
        
        // Navigate to login
        navigation.replace('Login');
    } catch (error) {
        console.error('Logout error:', error);
    }
};
```

---

### Step 6: Add Periodic Cleanup (15 minutes)

**File**: `frontend/App.js`

```javascript
import { useEffect } from 'react';
import SecureStorage from './src/utils/secureStorage';

export default function App() {
    useEffect(() => {
        // Clean expired files every hour
        const cleanupInterval = setInterval(() => {
            SecureStorage.cleanExpiredFiles();
        }, 60 * 60 * 1000); // 1 hour

        return () => clearInterval(cleanupInterval);
    }, []);

    // ... rest of app
}
```

---

### Step 7: Test Security Features (30 minutes)

#### Test Checklist:

**Screenshot Prevention**:
- [ ] Try taking screenshot on Android (should be blocked)
- [ ] Try taking screenshot on iOS (should show blur in task switcher)
- [ ] Verify blur appears when app goes to background

**File Storage**:
- [ ] Download a PDF/image
- [ ] Check it's NOT in device gallery/downloads
- [ ] Verify file is in app cache directory
- [ ] Logout and verify files are deleted

**PDF Viewer**:
- [ ] Try right-clicking (should be disabled)
- [ ] Try selecting text (should be disabled)
- [ ] Try Ctrl+C (should be disabled)
- [ ] Verify watermark is visible

**Image Viewer**:
- [ ] Try long-press save (should show alert)
- [ ] Verify watermark is visible
- [ ] Test pinch-to-zoom works

---

## 🔧 Optional: Android Native Screenshot Prevention

For full screenshot prevention on Android, you need to add native code:

### Step 1: Create Native Module

**File**: `android/app/src/main/java/com/zygote/ScreenshotPreventionModule.java`

```java
package com.zygote;

import android.view.WindowManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ScreenshotPreventionModule extends ReactContextBaseJavaModule {
    ScreenshotPreventionModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "ScreenshotPrevention";
    }

    @ReactMethod
    public void enablePrevention() {
        getCurrentActivity().getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }

    @ReactMethod
    public void disablePrevention() {
        getCurrentActivity().getWindow().clearFlags(
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
```

### Step 2: Register Module

**File**: `android/app/src/main/java/com/zygote/ScreenshotPreventionPackage.java`

```java
package com.zygote;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ScreenshotPreventionPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new ScreenshotPreventionModule(reactContext));
        return modules;
    }
}
```

### Step 3: Use in React Native

```javascript
import { NativeModules } from 'react-native';

const { ScreenshotPrevention } = NativeModules;

// Enable screenshot prevention
ScreenshotPrevention.enablePrevention();

// Disable (if needed)
ScreenshotPrevention.disablePrevention();
```

---

## 📊 Verification

After implementation, verify:

1. **Files are secure**:
   ```bash
   # Android
   adb shell
   cd /data/data/com.zygote.app/cache/secure/
   ls -la
   
   # Should see encrypted file names
   ```

2. **Screenshots blocked** (Android):
   - Take screenshot → Should see "Screenshot blocked" message

3. **Watermarks visible**:
   - Open PDF → Should see watermark overlay
   - Open image → Should see watermark overlay

4. **Files deleted on logout**:
   - Login → Download content
   - Logout
   - Check cache directory → Should be empty

---

## 🎯 Success Criteria

✅ Screenshots blocked on Android  
✅ Content blurred when app backgrounded (iOS)  
✅ Files saved to app-internal storage only  
✅ Files NOT visible in gallery/file manager  
✅ Watermarks visible on all content  
✅ Right-click/copy disabled in viewers  
✅ Files deleted on logout  
✅ Expired files auto-deleted  

---

## 🐛 Troubleshooting

### Issue: "expo-file-system not found"

**Solution**:
```bash
cd frontend
npm install expo-file-system
expo prebuild --clean
```

### Issue: "WebView not rendering"

**Solution**:
```bash
npm install react-native-webview
# For Expo
expo install react-native-webview
```

### Issue: Screenshots still working on Android

**Solution**:
- Implement native module (see Optional section above)
- Or use library: `npm install react-native-prevent-screenshot`

### Issue: Files visible in gallery

**Solution**:
- Verify you're using `FileSystem.cacheDirectory` not `documentDirectory`
- Check file paths in SecureStorage.js

---

## 📝 Next Steps

After implementing security:

1. **Test thoroughly** on both platforms
2. **Document** for your team
3. **Train** support staff on security features
4. **Monitor** audit logs for suspicious activity
5. **Update** terms of service with security policies

---

**Estimated Total Time**: 2-3 hours  
**Difficulty**: Medium  
**Priority**: High (for content protection)

---

*Last Updated: December 31, 2025*
