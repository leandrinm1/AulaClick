const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.overrides = { "undici": "5.28.4" };
pkg.dependencies["undici"] = "5.28.4";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
