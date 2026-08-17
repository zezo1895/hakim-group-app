import { api } from '../api/client';
import { storage } from './storage';
import { imageCache } from './imageCache';

export const syncService = {
  // Check if we need initial sync (no local data)
  needsInitialSync: async () => {
    const products = await storage.getProducts();
    return !products || products.length === 0;
  },
  
  // Full sync: download products, types, categories, and cache images
  // onProgress({ stage: 'data'|'images', current, total, message })
  fullSync: async (onProgress) => {
    try {
      // 1. Call onProgress with stage 'data' message 'جاري تحميل البيانات...'
      if (onProgress) {
        onProgress({ stage: 'data', current: 0, total: 3, message: 'جاري تحميل البيانات...' });
      }
      
      // 2. Fetch products, types, categories from API
      const [products, productTypes, materialCategories] = await Promise.all([
        api.getProducts(),
        api.getProductTypes(),
        api.getMaterialCategories()
      ]);
      
      if (onProgress) {
        onProgress({ stage: 'data', current: 3, total: 3, message: 'تم تحميل البيانات بنجاح' });
      }

      // 3. Save to storage
      await Promise.all([
        storage.setProducts(products),
        storage.setProductTypes(productTypes),
        storage.setMaterialCategories(materialCategories),
      ]);
      
      // 4. Call onProgress with stage 'images'
      if (onProgress) {
        onProgress({ stage: 'images', current: 0, total: 0, message: 'جاري تحميل الصور...' });
      }
      
      // 5. Call imageCache.cacheAllImages with progress callback
      await imageCache.cacheAllImages(products, (current, total) => {
        if (onProgress) {
          onProgress({ 
            stage: 'images', 
            current, 
            total, 
            message: `جاري تحميل الصور (${current}/${total})...` 
          });
        }
      });
      
      // 6. Save last sync timestamp
      await storage.setLastSync(new Date().toISOString());
      
      // 7. Return the data
      return { products, productTypes, materialCategories };
    } catch (error) {
      console.error('Error during full sync:', error);
      throw error;
    }
  },
  
  // Quick check if update available (compare product count or timestamp)
  checkForUpdates: async () => {
    try {
      const lastSync = await storage.getLastSync();
      if (!lastSync) return true;
      
      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const hoursSinceSync = (now - lastSyncDate) / (1000 * 60 * 60);
      
      // Check if it's been more than 1 hour since last sync
      if (hoursSinceSync > 1) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false; // Fallback to no updates if error
    }
  },
  
  // Load all local data
  getLocalData: async () => {
    return {
      products: await storage.getProducts(),
      productTypes: await storage.getProductTypes(),
      materialCategories: await storage.getMaterialCategories(),
    };
  },
};
