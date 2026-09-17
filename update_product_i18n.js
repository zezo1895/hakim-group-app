const fs = require('fs');
const path = require('path');

function updateFile(filename) {
  const filePath = path.join(__dirname, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace {product.name} with {i18n.language === 'en' && product.name_en ? product.name_en : product.name}
  content = content.replace(/\{product\.name\}/g, "{i18n.language === 'en' && product.name_en ? product.name_en : product.name}");
  
  // Replace {product.size} with {i18n.language === 'en' && product.size_en ? product.size_en : product.size}
  content = content.replace(/\{product\.size\}/g, "{i18n.language === 'en' && product.size_en ? product.size_en : product.size}");
  
  // Replace {product.notes} with {i18n.language === 'en' && product.notes_en ? product.notes_en : product.notes}
  content = content.replace(/\{product\.notes\}/g, "{i18n.language === 'en' && product.notes_en ? product.notes_en : product.notes}");

  // Also replace some static words in ProductDetailScreen
  if (filename.includes('ProductDetailScreen')) {
    content = content.replace(/'المقاس'/g, "t('size')");
    content = content.replace(/'ملاحظات'/g, "t('notes')");
    content = content.replace(/'المادة'/g, "t('material')");
    content = content.replace(/'الاستخدام'/g, "t('temperature')");
    content = content.replace(/'القسم'/g, "t('category')");
    content = content.replace(/'ساخن'/g, "t('hot')");
    content = content.replace(/'بارد'/g, "t('cold')");
    content = content.replace(/'ساخن \/ بارد'/g, "t('hot_cold')");
    content = content.replace(/'الأغطية المتوافقة'/g, "t('compatible_lids')");
    content = content.replace(/'مقاسات أخرى'/g, "t('other_sizes')");
  }

  fs.writeFileSync(filePath, content);
}

updateFile('src/components/ProductCard.js');
updateFile('src/screens/ProductDetailScreen.js');

console.log("Updated product properties for i18n");
