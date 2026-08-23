import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, I18nManager, Alert, Linking } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AdminScreen from './src/screens/AdminScreen';
import SyncProgressComponent from './src/components/SyncProgress';
import { syncService } from './src/services/syncService';
import { imageCache } from './src/services/imageCache';
import { api } from './src/api/client';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from './src/theme';

// Force RTL
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

// Catch fatal errors and show them on screen instead of crashing
if (!__DEV__) {
  const globalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    Alert.alert('حدث خطأ', String(error) + '\n\n' + (error.stack || ''));
    if (globalHandler) {
      globalHandler(error, isFatal);
    }
  });
}

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ progress: 0, message: '', stage: 'data' });
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDownloadAndInstall = async () => {
    try {
      setIsDownloading(true);

      let finalUrl = updateUrl;
      
      // Convert Dropbox link to direct download automatically
      if (updateUrl.includes('dropbox.com')) {
        finalUrl = updateUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
      }

      // Download the APK to the app's cache directory
      const fileUri = FileSystem.cacheDirectory + 'HakimApp_Update.apk';
      const downloadResumable = FileSystem.createDownloadResumable(
        finalUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      // Get a content:// URI to bypass Android's strict FileUriExposedException
      const contentUri = await FileSystem.getContentUriAsync(uri);
      
      // Launch Android's Package Installer natively!
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
      
      setIsDownloading(false);
      
    } catch (error) {
      console.log('Download error:', error);
      // Fallback: If intent launcher fails, open in browser
      try {
        await Linking.openURL(updateUrl);
      } catch (e) {}

      Alert.alert(
        'سبب منع التثبيت الداخلي', 
        `الأندرويد منع التثبيت الداخلي والسبب التقني هو:\n\n${error.message || String(error)}\n\n(تم تحويلك للمتصفح كبديل مؤقت)`
      );
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    prepare();
  }, []);

  async function prepare() {
    try {
      if (imageCache && imageCache.init) {
        await imageCache.init();
      }
      
      // Check for mandatory app update first
      try {
        if (api && api.checkAppVersion) {
          const versionData = await api.checkAppVersion();
          const currentNativeVersion = Constants.expoConfig?.version || '1.0.0';
          
          if (versionData && versionData.latestVersion && versionData.latestVersion !== currentNativeVersion) {
            setUpdateUrl(versionData.downloadUrl);
            setUpdateRequired(true);
            try { await SplashScreen.hideAsync(); } catch (e) {}
            return; // Block further loading
          }
        }
      } catch (e) {
        console.log('Update check failed, continuing normally', e);
      }

      let needsSync = false;
      if (syncService && syncService.needsInitialSync) {
        needsSync = await syncService.needsInitialSync();
      }
      
      if (needsSync) {
        setIsSyncing(true);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {}
        
        await syncService.fullSync(({ stage, current, total, message }) => {
          setSyncProgress({
            progress: total > 0 ? current / total : 0,
            message,
            stage,
          });
        });
        setIsSyncing(false);
      } else {
        // Run intelligent background check if not initial sync!
        // We do not await this, it runs silently in the background
        setTimeout(async () => {
          try {
            console.log('Running background check for new products...');
            const localProducts = await syncService.getLocalData().then(d => d.products);
            const remoteProducts = await api.getProducts();
            
            // If the counts are different, or we want a deeper check, we sync!
            if (remoteProducts && localProducts && remoteProducts.length !== localProducts.length) {
              console.log(`Found differences! Local: ${localProducts.length}, Remote: ${remoteProducts.length}. Updating quietly...`);
              // Save new data
              await storage.setProducts(remoteProducts);
              // Cache only the NEW images (cacheAllImages skips existing ones instantly)
              await imageCache.cacheAllImages(remoteProducts);
              console.log('Background update complete!');
            }
          } catch (err) {
            console.log('Background sync failed quietly', err);
          }
        }, 3000); // Wait 3 seconds after app launch to not impact performance
      }
      
      setIsReady(true);
      try {
        await SplashScreen.hideAsync();
      } catch (e) {}
    } catch (e) {
      console.error('Prepare error:', e);
      setIsReady(true);
      try {
        await SplashScreen.hideAsync();
      } catch (err) {}
    }
  }

  if (isSyncing) {
    return (
      <SafeAreaProvider>
        <SyncProgressComponent {...syncProgress} />
      </SafeAreaProvider>
    );
  }

  if (updateRequired) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
          <Pressable 
            onLongPress={() => {
              setUpdateRequired(false);
              setIsReady(true); // Fix the blank screen bypass
            }} 
            delayLongPress={3000}
            style={{ width: 100, height: 100, backgroundColor: '#E8F5E9', borderRadius: RADIUS.full, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl }}
          >
            <Text style={{ fontSize: 40 }}>🚀</Text>
          </Pressable>
          <Text style={{ fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.primary, marginBottom: SPACING.md, textAlign: 'center' }}>تحديث إجباري</Text>
          <Text style={{ fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.xxl, textAlign: 'center', lineHeight: 24 }}>
            تم إطلاق نسخة جديدة من التطبيق. يرجى التحديث الآن لضمان عمل التطبيق بأفضل شكل واستمرار مزامنة البيانات.
          </Text>
          <View style={{ width: '100%', overflow: 'hidden', borderRadius: RADIUS.md }}>
            {isDownloading ? (
              <View style={{ backgroundColor: COLORS.surfaceAlt, paddingVertical: SPACING.md, alignItems: 'center' }}>
                <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.md, marginBottom: SPACING.sm, fontWeight: 'bold' }}>
                  جاري التحميل... {Math.round(downloadProgress * 100)}%
                </Text>
                <View style={{ width: '90%', height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
                  <View style={{ width: `${downloadProgress * 100}%`, height: '100%', backgroundColor: COLORS.primary }} />
                </View>
              </View>
            ) : (
              <Pressable onPress={handleDownloadAndInstall} style={{ backgroundColor: COLORS.primary, paddingVertical: SPACING.md, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: FONT_SIZES.lg, fontWeight: 'bold' }}>تحديث وتثبيت الآن</Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left' }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
