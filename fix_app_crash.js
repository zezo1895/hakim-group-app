const fs = require('fs');

let content = fs.readFileSync('App.js', 'utf8');

// Ensure proper imports at the top
if (!content.includes("import { useTheme }")) {
  content = content.replace(
    "import { ThemeProvider } from './src/context/ThemeContext';", 
    "import { ThemeProvider, useTheme } from './src/context/ThemeContext';\nimport { useTranslation } from 'react-i18next';"
  );
}

// Remove the bad injection from handleDownloadAndInstall
content = content.replace(
  "  const handleDownloadAndInstall = async () => {\n  const { colors, isDark } = useTheme();\n  const { t, i18n } = useTranslation();",
  "  const handleDownloadAndInstall = async () => {"
);

// Inject properly at the top of AppContent
if (!content.includes("const { colors, isDark } = useTheme();") || content.indexOf("const { colors, isDark } = useTheme();") > content.indexOf("function AppContent()")) {
  content = content.replace(
    "function AppContent() {",
    "function AppContent() {\n  const { colors, isDark } = useTheme();\n  const { t, i18n } = useTranslation();"
  );
}

fs.writeFileSync('App.js', content);
console.log('Fixed App.js undefined colors issue');
