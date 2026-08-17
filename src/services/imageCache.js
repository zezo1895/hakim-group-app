import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { storage } from './storage';

const IMAGE_DIR = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'hakim_images/' : '';

// In-memory map for O(1) synchronous lookups instead of async FileSystem calls
let memoryImageMap = null;

export const imageCache = {
  // Ensure the cache directory exists and load memory map
  init: async () => {
    if (Platform.OS === 'web') return; // FileSystem not supported on web
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
  
  // Generate a filename from a URL
  getFilename: (url) => {
    if (!url) return '';
    return url.split('/').pop().split('?')[0];
  },
  
  // Get local path for a URL (returns null if not cached)
  getLocalPath: (url) => {
    if (!url || Platform.OS === 'web') return null;
    if (memoryImageMap && memoryImageMap[url]) {
      return memoryImageMap[url];
    }
    return null;
  },
  
  // Download a single image and return local path
  downloadImage: async (url) => {
    if (!url || Platform.OS === 'web') return null;
    try {
      const filename = imageCache.getFilename(url);
      const localUri = IMAGE_DIR + filename;
      
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists) return localUri; // Already cached
      
      const downloadResult = await FileSystem.downloadAsync(url, localUri);
      if (downloadResult.status === 200) {
        return downloadResult.uri;
      }
      return null;
    } catch (error) {
      console.error(`Error downloading image ${url}:`, error);
      return null;
    }
  },
  
  // Cache all product images, calling onProgress(current, total)
  cacheAllImages: async (products, onProgress) => {
    await imageCache.init();
    
    // Collect all unique URLs
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
    const newMap = { ...existingMap };
    
    for (const url of urlsArray) {
      const localPath = await imageCache.downloadImage(url);
      if (localPath) {
        newMap[url] = localPath;
      }
      downloadedCount++;
      if (onProgress) {
        onProgress(downloadedCount, totalCount);
      }
    }
    
    memoryImageMap = newMap;
    await storage.setImageMap(newMap);
    return newMap;
  },
  
  // Get the URI to use for displaying (local if cached, remote otherwise)
  getImageUri: (url) => {
    if (!url) return null;
    const localPath = imageCache.getLocalPath(url);
    return localPath || url;
  },
  
  // Clear all cached images
  clearCache: async () => {
    if (Platform.OS === 'web') return;
    try {
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(IMAGE_DIR, { idempotent: true });
        await imageCache.init();
      }
      await storage.setImageMap({});
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  },
};
