const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const parts = content.split('const { t, i18n } = useTranslation();');
      if (parts.length > 2) {
        // More than 1 occurrence, join back keeping only the first one
        const newContent = [parts[0], parts.slice(1).join('')].join('const { t, i18n } = useTranslation();');
        fs.writeFileSync(fullPath, newContent);
        console.log(`Fixed duplicates in ${file}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'components'));
processDir(path.join(__dirname, 'src', 'screens'));
