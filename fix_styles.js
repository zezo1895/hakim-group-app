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
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Convert const styles = StyleSheet.create({ ... }) to const getStyles = (colors, isDark) => StyleSheet.create({ ... })
  if (content.includes('const styles = StyleSheet.create(')) {
    content = content.replace(/const styles = StyleSheet\.create\(/, 'const getStyles = (colors, isDark) => StyleSheet.create(');
    
    // Find component body to inject: const styles = getStyles(colors, isDark);
    const componentMatch = content.match(/const\s+(\w+)\s*=\s*(?:memo\()?\(?(\{?[^)]*\}?)\)?\s*=>\s*\{/);
    if (componentMatch) {
      const componentBodyStart = content.indexOf('{', componentMatch.index + componentMatch[0].length - 2) + 1;
      
      // Remove any existing `const styles = getStyles(colors, isDark);` to avoid duplicates
      content = content.replace(/\n\s*const styles = getStyles\(colors, isDark\);/, '');
      
      // Inject it right after useTheme()
      const useThemeMatch = content.match(/const \{ colors, isDark \} = useTheme\(\);/);
      if (useThemeMatch) {
         content = content.replace(/const \{ colors, isDark \} = useTheme\(\);/, 'const { colors, isDark } = useTheme();\n  const styles = getStyles(colors, isDark);');
      } else {
        // Fallback
        const injections = `\n  const styles = getStyles(colors, isDark);`;
        content = content.slice(0, componentBodyStart) + injections + content.slice(componentBodyStart);
      }
    }
  }

  // Also fix "colors" that might be undefined in some scopes
  fs.writeFileSync(filePath, content);
});

console.log("Styles updated to be dynamic!");
