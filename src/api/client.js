import { getApiUrl, FALLBACK_API_URL } from '../services/remoteConfig';

// Cache the resolved URL in memory after first call
let _cachedUrl = null;

const getBaseUrl = async () => {
  if (_cachedUrl) return _cachedUrl;
  try {
    _cachedUrl = await getApiUrl();
  } catch (e) {
    _cachedUrl = FALLBACK_API_URL;
  }
  return _cachedUrl;
};

// Allow resetting cached URL (e.g., after remote config update)
export const resetApiUrlCache = () => { _cachedUrl = null; };

export const api = {
  // GET /api/app-version - returns { latestVersion, downloadUrl, forceUpdate }
  checkAppVersion: async () => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/app-version`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error checking app version:', error);
      return null;
    }
  },

  // POST /api/app-version/request-update
  requestAppUpdate: async (downloadUrl, adminSecret) => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/app-version/request-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({ downloadUrl })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request update');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // POST /api/app-version/confirm-update
  confirmAppUpdate: async (otp, adminSecret) => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/app-version/confirm-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({ otp })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm update');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // GET /api/products - returns array of products with images
  getProducts: async () => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  // GET /api/products/types - returns [{id, name}]
  getProductTypes: async () => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products/types`);
      if (!response.ok) throw new Error('Failed to fetch product types');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  },
  
  // GET /api/products/material-categories - returns [{id, name}]
  getMaterialCategories: async () => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products/material-categories`);
      if (!response.ok) throw new Error('Failed to fetch material categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching material categories:', error);
      throw error;
    }
  },
  
  // GET /api/products/:id - returns product with lids, siblings
  getProduct: async (id) => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product details');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  // GET /api/products/search?q= - returns search results (max 12)
  searchProducts: async (query) => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search products');
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
  
  // POST /api/products/analytics/search - log search query
  logSearch: async (query) => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products/analytics/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Failed to log search');
      return await response.json();
    } catch (error) {
      console.error('Error logging search:', error);
      throw error;
    }
  },
  
  // POST /api/products/:id/view - increment view
  incrementView: async (id) => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products/${id}/view`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to increment view');
      return await response.json();
    } catch (error) {
      console.error('Error incrementing view:', error);
      throw error;
    }
  },
  
  // GET /api/products/analytics (needs header x-admin-secret)
  getAnalytics: async () => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/products/analytics`, {
        headers: { 'x-admin-secret': '1832003Ziad$$z' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error details:', response.status, errorText);
        throw new Error('Failed to fetch analytics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
};
