const fs = require('fs');

let content = fs.readFileSync('App.js', 'utf8');
content = content.replace("import { SafeAreaProvider } from 'react-native-safe-area-context';", "");
content = content.replace("import { ThemeProvider } from './src/context/ThemeContext';", "import { SafeAreaProvider } from 'react-native-safe-area-context';\nimport { ThemeProvider } from './src/context/ThemeContext';");

fs.writeFileSync('App.js', content);
console.log('Fixed App.js import order');
