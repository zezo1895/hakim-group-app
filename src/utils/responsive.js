import { Dimensions, Platform } from 'react-native';

export const isTablet = (w) => {
  const width = w || Dimensions.get('window').width;
  return width >= 768;
};

export const getProductColumns = (width) => {
  if (width >= 1200) return 4;
  if (width >= 768) return 3;
  return 2;
};

export const getSidebarWidth = () => isTablet() ? 200 : 0;
