const fs = require('fs');
const path = require('path');
function processFile(p) {
  if (!p.endsWith('.js')) return;
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;
  if (c.match(/=\s*t\('/)) { c = c.replace(/=\s*t\('([^']+)'\)/g, "= ''"); changed = true; }
  if (c.includes("t('") && !c.includes("const { t")) {
    if (!c.includes('import i18n')) {
      let importPath = p.includes('src') ? '../i18n' : './src/i18n';
      if(p.includes('services') || p.includes('components')) importPath = '../i18n';
      c = "import i18n from '" + importPath + "';\n" + c;
    }
    c = c.replace(/([^\w])t\('/g, "$1i18n.t('");
    changed = true;
  }
  if (changed) { fs.writeFileSync(p, c); console.log('Fixed', p); }
}
function fix(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) fix(p);
    else processFile(p);
  });
}
fix('./src');
processFile('./App.js');
