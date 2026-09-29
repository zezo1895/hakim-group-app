import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { storage } from './storage';

const IMAGE_DIR = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'hakim_images/' : '';

// In-memory map for O(1) synchronous lookups instead of async FileSystem calls
let memoryImageMap = null;

export const imageCache = {
  init: async () => {
    if (Platform.OS === 'web') return; 
    try {
      if (!memoryImageMap) {
        memoryImageMap = (await storage.getImageMap()) || {};
      }
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing image cache:', error);
    }
  },
  
  getFilename: (url) => {
    if (!url) return '';
    const parts = url.split('/');
    if (parts.length >= 2) {
      const filename = parts[parts.length - 1].split('?')[0];
      const parentFolder = parts[parts.length - 2];
      // Replace illegal characters
      return `${parentFolder}_${filename}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    }
    return url.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9.\-_]/g, '_');
  },
  
  getLocalPath: (url) => {
    if (!url || Platform.OS === 'web') return null;
    if (memoryImageMap && memoryImageMap[url]) {
      return memoryImageMap[url];
    }
    return null;
  },
  
  downloadImage: async (url) => {
    if (!url || Platform.OS === 'web') return null;
    try {
      const filename = imageCache.getFilename(url);
      const localUri = IMAGE_DIR + filename;
      
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists) return localUri; // Already cached
      
      // Fix invalid URLs with spaces or Arabic chars
      const safeUrl = encodeURI(url.trim());
      
      const downloadResult = await FileSystem.downloadAsync(safeUrl, localUri);
      if (downloadResult.status === 200) {
        return downloadResult.uri;
      }
      return null;
    } catch (error) {
      console.error(`Error downloading image ${url}:`, error.message);
      return null;
    }
  },
  
  cacheAllImages: async (products, onProgress) => {
    await imageCache.init();
    
    const urlsToCache = new Set();
    if (products && Array.isArray(products)) {
      products.forEach(product => {
        if (product.images && Array.isArray(product.images)) {
          product.images.forEach(img => {
            if (img.url) urlsToCache.add(img.url);
          });
        }
      });
    }
    
    const urlsArray = Array.from(urlsToCache);
    const totalCount = urlsArray.length;
    let downloadedCount = 0;
    
    const existingMap = (await storage.getImageMap()) || {};
    let newMap = { ...existingMap };
    let hasChanges = false;
    
    for (const url of urlsArray) {
      // Fast path: if it's already in the map, just increment and skip download
      if (newMap[url]) {
        downloadedCount++;
        if (onProgress) onProgress(downloadedCount, totalCount);
        continue;
      }
      
      const localPath = await imageCache.downloadImage(url);
      if (localPath) {
        newMap[url] = localPath;
        memoryImageMap[url] = localPath;
        hasChanges = true;
      }
      
      downloadedCount++;
      if (onProgress) {
        onProgress(downloadedCount, totalCount);
      }
      
      // Save every 5 images so if app closes, it remembers progress!
      if (hasChanges && downloadedCount % 5 === 0) {
        await storage.setImageMap(newMap);
        hasChanges = false;
      }
    }
    
    // Final save
    if (hasChanges) {
      await storage.setImageMap(newMap);
    }
    return newMap;
  },
  
  clearCache: async () => {
    if (Platform.OS === 'web') return;
    try {
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(IMAGE_DIR, { idempotent: true });
        await imageCache.init();
      }
      await storage.setImageMap({});
      memoryImageMap = {};
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  },
};
