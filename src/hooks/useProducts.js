import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeMaterial, setActiveMaterial] = useState('all');
  const [activeTemp, setActiveTemp] = useState('all');
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
        setMaterialCategories(data.materialCategories || []);
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

  const setAdvancedFilters = useCallback((material, temp) => {
    setActiveMaterial(material);
    setActiveTemp(temp);
  }, []);

  const searchProducts = useCallback((query) => {
    console.log(`[useProducts] searchProducts called with: "${query}"`);
    setSearchQuery(query);
  }, []);

  // Arabic normalization utility
  const normalizeArabic = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ةه]/g, 'ه')
      .replace(/[يى]/g, 'ي')
      .replace(/[ًٌٍَُِّْ]/g, '') // Remove tashkeel
      .trim();
  };

  // Derive filtered products
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || !activeCategory || p.type_id === activeCategory;
    if (!matchesCategory) return false;

    const matchesMaterial = activeMaterial === 'all' || !activeMaterial || p.material_category === activeMaterial;
    if (!matchesMaterial) return false;

    const matchesTemp = activeTemp === 'all' || !activeTemp || p.temp === activeTemp;
    if (!matchesTemp) return false;
    
    if (!searchQuery || searchQuery.trim() === '') return true;
    
    const normalizedQuery = normalizeArabic(searchQuery);
    const queryWords = normalizedQuery.split(/\s+/);
    
    const searchableText = normalizeArabic(`${p.name} ${p.code} ${p.type_name} ${p.material_name} ${p.material_category}`);
    
    return queryWords.every(word => searchableText.includes(word));
  });

  console.log(`[useProducts] Rendered with searchQuery: "${searchQuery}", activeCategory: "${activeCategory}", activeMaterial: "${activeMaterial}". Filtered ${filteredProducts.length} products.`);

  return { 
    products, 
    productTypes, 
    materialCategories,
    filteredProducts, 
    isLoading, 
    error, 
    refresh, 
    filterByCategory, 
    setAdvancedFilters,
    searchProducts,
    activeCategory,
    activeMaterial,
    activeTemp,
    searchQuery,
    setSearchQuery
  };
}
