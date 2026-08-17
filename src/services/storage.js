import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PRODUCTS: 'hakim_products',
  PRODUCT_TYPES: 'hakim_product_types',
  MATERIAL_CATEGORIES: 'hakim_material_categories',
  LAST_SYNC: 'hakim_last_sync',
  IMAGE_MAP: 'hakim_image_map',
  SEARCH_HISTORY: 'hakim_search_history',
};

const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading data for key ${key}:`, error);
    return null;
  }
};

const setData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
  }
};

export const storage = {
  getProducts: () => getData(KEYS.PRODUCTS),
  setProducts: (products) => setData(KEYS.PRODUCTS, products),
  
  getProductTypes: () => getData(KEYS.PRODUCT_TYPES),
  setProductTypes: (types) => setData(KEYS.PRODUCT_TYPES, types),
  
  getMaterialCategories: () => getData(KEYS.MATERIAL_CATEGORIES),
  setMaterialCategories: (categories) => setData(KEYS.MATERIAL_CATEGORIES, categories),
  
  getLastSync: () => getData(KEYS.LAST_SYNC),
  setLastSync: (timestamp) => setData(KEYS.LAST_SYNC, timestamp),
  
  getImageMap: () => getData(KEYS.IMAGE_MAP),
  setImageMap: (map) => setData(KEYS.IMAGE_MAP, map),
  
  getSearchHistory: async () => {
    const history = await getData(KEYS.SEARCH_HISTORY);
    return history || [];
  },
  addSearchQuery: async (query) => {
    try {
      const history = await getData(KEYS.SEARCH_HISTORY) || [];
      const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 10);
      await setData(KEYS.SEARCH_HISTORY, newHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  },
  
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
