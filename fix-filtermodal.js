const fs = require('fs');

let content = fs.readFileSync('src/components/FilterModal.js', 'utf8');
content = content.replace("name: t('hot')", "name: 'ساخن'");
content = content.replace("name: t('cold')", "name: 'بارد'");
fs.writeFileSync('src/components/FilterModal.js', content);
console.log('Fixed FilterModal.js');
