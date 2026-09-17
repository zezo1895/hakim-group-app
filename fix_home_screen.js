const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/screens/HomeScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the bad injections in handleManualFullSync
content = content.replace(/  const handleManualFullSync = async \(\) => \{\n  const \{ colors, isDark, changeTheme \} = useTheme\(\);\n  const styles = getStyles\(colors, isDark\);\n  const \{ t, i18n \} = useTranslation\(\);/, '  const handleManualFullSync = async () => {');

// 2. Add them to the top of HomeScreen
const targetComponent = 'export default function HomeScreen({ navigation }) {';
const properInjections = `export default function HomeScreen({ navigation }) {
  const { colors, isDark, changeTheme } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t, i18n } = useTranslation();`;

if (!content.includes('const styles = getStyles(colors, isDark);')) {
  content = content.replace(targetComponent, properInjections);
} else {
  // if it's already there but just need to remove the duplicate
  if (!content.match(/export default function HomeScreen[^]*?const styles = getStyles/)) {
      content = content.replace(targetComponent, properInjections);
  }
}

fs.writeFileSync(filePath, content);
console.log('Fixed HomeScreen.js');
