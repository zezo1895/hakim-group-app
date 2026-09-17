const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/screens/HomeScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add changeTheme to useTheme
content = content.replace(/const \{ colors, isDark \} = useTheme\(\);/, 'const { colors, isDark, changeTheme } = useTheme();');

// 2. Inject toggles
const targetStr = `<TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleManualFullSync}
              disabled={isSyncing}
            >`;

const replacementStr = `<TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => changeTheme(isDark ? 'light' : 'dark')}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
            >
              <Ionicons name="language" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleManualFullSync}
              disabled={isSyncing}
            >`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(filePath, content);
console.log("Injected toggles into HomeScreen.js");
