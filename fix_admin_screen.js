const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/screens/AdminScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the bad injections in fetchAppVersion
content = content.replace(/  const fetchAppVersion = async \(\) => \{\n  const \{ t, i18n \} = useTranslation\(\);\n  const \{ colors, isDark \} = useTheme\(\);\n  const styles = getStyles\(colors, isDark\);\n  const \{ t, i18n \} = useTranslation\(\);/, '  const fetchAppVersion = async () => {');

// 2. Add them to the top of AdminScreen
const targetComponent = 'export default function AdminScreen({ navigation }) {';
const properInjections = `export default function AdminScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t, i18n } = useTranslation();`;

content = content.replace(targetComponent, properInjections);

fs.writeFileSync(filePath, content);
console.log('Fixed AdminScreen.js');
