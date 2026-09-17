const fs = require('fs');

const enPath = 'src/i18n/locales/en.json';
const arPath = 'src/i18n/locales/ar.json';

function readJsonStrippedBOM(path) {
  let content = fs.readFileSync(path, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

let en = readJsonStrippedBOM(enPath);
let ar = readJsonStrippedBOM(arPath);

const newEnKeys = {
  "all_products": "All Products",
  "no_products_desc": "Make sure to refresh data or change your search.",
  "sync_data": "Refresh Data",
  "size": "Size",
  "notes": "Notes",
  "material": "Material",
  "temperature": "Usage",
  "category": "Category"
};

const newArKeys = {
  "all_products": "جميع المنتجات",
  "no_products_desc": "تأكد من تحديث البيانات أو تغيير البحث.",
  "sync_data": "تحديث البيانات",
  "size": "المقاس",
  "notes": "ملاحظات",
  "material": "المادة",
  "temperature": "الاستخدام",
  "category": "القسم"
};

Object.assign(en, newEnKeys);
Object.assign(ar, newArKeys);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));

console.log("Locales updated!");
