const fs = require('fs');
const path = require('path');

const files = [
  'src/components/ProductCard.js',
  'src/components/SearchBar.js',
  'src/components/Sidebar.js',
  'src/components/SyncProgress.js',
  'src/components/FilterModal.js',
  'src/components/AdminPasswordModal.js',
  'src/components/ImageCarousel.js',
  'src/screens/HomeScreen.js',
  'src/screens/ProductDetailScreen.js',
  'src/screens/AdminScreen.js',
  'App.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. App.js i18n
  if (file === 'App.js' && !content.includes("import './src/i18n'")) {
    content = "import './src/i18n';\n" + content;
  }
  
  // 2. Import useTheme and useTranslation if not present
  const isScreen = file.includes('Screen');
  const isApp = file === 'App.js';
  
  if (!isApp && !content.includes('useTheme')) {
    const importContext = `import { useTheme } from '../context/ThemeContext';\n`;
    content = content.replace(/(import React.*?;\n)/, `$1${importContext}`);
  }
  
  if (!isApp && !content.includes('useTranslation')) {
    content = content.replace(/(import React.*?;\n)/, `$1import { useTranslation } from 'react-i18next';\n`);
  }

  // 3. Inject hooks into functional components
  const componentMatch = content.match(/const\s+(\w+)\s*=\s*(?:memo\()?\(?(\{?[^)]*\}?)\)?\s*=>\s*\{/);
  if (componentMatch) {
    const componentBodyStart = content.indexOf('{', componentMatch.index + componentMatch[0].length - 2) + 1;
    const existingBody = content.substring(componentBodyStart, componentBodyStart + 100);
    
    let injections = '';
    if (!existingBody.includes('useTheme(')) injections += `\n  const { colors, isDark } = useTheme();`;
    if (!existingBody.includes('useTranslation(')) injections += `\n  const { t, i18n } = useTranslation();`;
    
    if (injections) {
      content = content.slice(0, componentBodyStart) + injections + content.slice(componentBodyStart);
    }
  }

  // 4. Replace static COLORS. with colors.
  content = content.replace(/COLORS\./g, 'colors.');
  
  // 5. Replace text strings with t('...')
  // For HomeScreen.js:
  content = content.replace(/'جميع المنتجات'/g, "t('all_products')");
  content = content.replace(/'لا توجد منتجات'/g, "t('no_products')");
  content = content.replace(/'تأكد من تحديث البيانات أو تغيير البحث.'/g, "t('no_products_desc')");
  content = content.replace(/'تحديث البيانات'/g, "t('sync_data')");
  
  // For ProductCard.js:
  content = content.replace(/'ساخن'/g, "t('hot')");
  content = content.replace(/'بارد'/g, "t('cold')");
  content = content.replace(/'ساخن \/ بارد'/g, "t('hot_cold')");

  // For SearchBar.js:
  content = content.replace(/'ابحث عن منتج...'/g, "t('search_placeholder')");

  // For Sidebar.js:
  content = content.replace(/'الفئات'/g, "t('categories')");

  // Save
  fs.writeFileSync(filePath, content);
});

console.log("UI Components updated!");
