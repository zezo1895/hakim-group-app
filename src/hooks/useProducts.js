import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await syncService.getLocalData();
      if (data) {
        setProducts(data.products || []);
        setProductTypes(data.productTypes || []);
      }
    } catch (err) {
      setError(err);
      console.error('Error loading local data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const filterByCategory = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  const searchProducts = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Derive filtered products
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || !activeCategory || p.type_id === activeCategory;
    
    if (!matchesCategory) return false;
    
    if (!searchQuery || searchQuery.trim() === '') return true;
    
    const lowerQuery = searchQuery.toLowerCase();
    return (p.name && p.name.toLowerCase().includes(lowerQuery)) || 
           (p.code && p.code.toLowerCase().includes(lowerQuery));
  });

  return { 
    products, 
    productTypes, 
    filteredProducts, 
    isLoading, 
    error, 
    refresh, 
    filterByCategory, 
    searchProducts,
    activeCategory,
    searchQuery,
    setSearchQuery
  };
}
