const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Forzamos la versión de undici en todo el árbol de dependencias
pkg.overrides = {
  "undici": "6.13.0"
};

// Aseguramos que las dependencias críticas estén presentes
pkg.dependencies = pkg.dependencies || {};
pkg.dependencies["undici"] = "6.13.0";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
