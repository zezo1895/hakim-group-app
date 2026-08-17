const BASE_URL = 'https://hakim-production-3e6c.up.railway.app/api';

export const api = {
  // GET /api/app-version - returns { latestVersion, downloadUrl, forceUpdate }
  checkAppVersion: async () => {
    try {
      const response = await fetch(`${BASE_URL}/app-version`);
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
      const response = await fetch(`${BASE_URL}/app-version/request-update`, {
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
      const response = await fetch(`${BASE_URL}/app-version/confirm-update`, {
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
      const response = await fetch(`${BASE_URL}/products`);
      if (!response.ok) throw new Error('فشل جلب المنتجات');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  // GET /api/products/types - returns [{id, name}]
  getProductTypes: async () => {
    try {
      const response = await fetch(`${BASE_URL}/products/types`);
      if (!response.ok) throw new Error('فشل جلب أنواع المنتجات');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  },
  
  // GET /api/products/material-categories - returns [{id, name}]
  getMaterialCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/products/material-categories`);
      if (!response.ok) throw new Error('فشل جلب فئات المواد');
      return await response.json();
    } catch (error) {
      console.error('Error fetching material categories:', error);
      throw error;
    }
  },
  
  // GET /api/products/:id - returns product with lids, siblings
  getProduct: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('فشل جلب تفاصيل المنتج');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  // GET /api/products/search?q= - returns search results (max 12)
  searchProducts: async (query) => {
    try {
      const response = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('فشل البحث عن المنتجات');
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
  
  // POST /api/products/analytics/search - log search query
  logSearch: async (query) => {
    try {
      const response = await fetch(`${BASE_URL}/products/analytics/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('فشل تسجيل البحث');
      return await response.json();
    } catch (error) {
      console.error('Error logging search:', error);
      throw error;
    }
  },
  
  // POST /api/products/:id/view - increment view
  incrementView: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/products/${id}/view`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('فشل تسجيل المشاهدة');
      return await response.json();
    } catch (error) {
      console.error('Error incrementing view:', error);
      throw error;
    }
  },
  
  // GET /api/products/analytics (needs header x-admin-secret: 123456)
  getAnalytics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/products/analytics`, {
        headers: { 'x-admin-secret': '123456' },
      });
      if (!response.ok) throw new Error('فشل جلب التحليلات');
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
};
