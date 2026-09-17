const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/screens/ProductDetailScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
if (!content.includes('useTheme')) {
  content = content.replace(/(import React.*?;\n)/, `$1import { useTheme } from '../context/ThemeContext';\nimport { useTranslation } from 'react-i18next';\n`);
}

// 2. Component injection
content = content.replace(/export default function ProductDetailScreen\(\{ route, navigation \}\) \{/, 
`export default function ProductDetailScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t, i18n } = useTranslation();`);

// 3. Styles to getStyles
if (content.includes('const styles = StyleSheet.create(')) {
  content = content.replace(/const styles = StyleSheet\.create\(/, 'const getStyles = (colors, isDark) => StyleSheet.create(');
}

// 4. COLORS to colors
content = content.replace(/COLORS\./g, 'colors.');

// 5. Product Names
content = content.replace(/\{product\.name\}/g, "{i18n.language === 'en' && product.name_en ? product.name_en : product.name}");
content = content.replace(/\{product\.notes\}/g, "{i18n.language === 'en' && product.notes_en ? product.notes_en : product.notes}");

// 6. Translations
content = content.replace(/'المقاس'/g, "t('size')");
content = content.replace(/'ملاحظات'/g, "t('notes')");
content = content.replace(/'المادة'/g, "t('material')");
content = content.replace(/'الاستخدام'/g, "t('temperature')");
content = content.replace(/'القسم'/g, "t('category')");
content = content.replace(/'الأغطية المتوافقة'/g, "t('compatible_lids')");
content = content.replace(/'مقاسات أخرى'/g, "t('other_sizes')");

fs.writeFileSync(filePath, content);
console.log("Fixed ProductDetailScreen.js");
