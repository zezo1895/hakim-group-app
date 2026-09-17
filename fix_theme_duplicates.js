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
      
      const themeParts = content.split('const { colors, isDark } = useTheme();');
      if (themeParts.length > 2) {
        console.log(`Duplicate useTheme found in ${file}`);
        const newContent = [themeParts[0], themeParts.slice(1).join('')].join('const { colors, isDark } = useTheme();');
        fs.writeFileSync(fullPath, newContent);
      }
      
      const stylesParts = content.split('const styles = getStyles(colors, isDark);');
      if (stylesParts.length > 2) {
        console.log(`Duplicate styles found in ${file}`);
        const newContent = [stylesParts[0], stylesParts.slice(1).join('')].join('const styles = getStyles(colors, isDark);');
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'components'));
processDir(path.join(__dirname, 'src', 'screens'));
console.log('Checked for duplicate theme/styles');
