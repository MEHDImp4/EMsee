const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'frontend', 'public', 'locales');
const locales = ['en', 'fr', 'es'];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function collectKeys(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys.push(...collectKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function getValueByKey(obj, key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const plaques = new Set();
  // handlebars-like
  const reHandle = /{{\s*[\w.]+\s*}}/g;
  const reReactInter = /<\d+>|<\/(?:\d+)>/g; // <1> ... </1>
  const rePercent = /%s|%d/g;
  let m;
  while ((m = reHandle.exec(str))) plaques.add(m[0]);
  while ((m = reReactInter.exec(str))) plaques.add(m[0]);
  while ((m = rePercent.exec(str))) plaques.add(m[0]);
  return Array.from(plaques);
}

const data = {};
for (const loc of locales) {
  const p = path.join(localesDir, loc, 'translation.json');
  if (!fs.existsSync(p)) {
    console.error(`Missing file: ${p}`);
    process.exit(1);
  }
  data[loc] = readJson(p);
}

// collect all keys
const allKeys = new Set();
for (const loc of locales) {
  collectKeys(data[loc]).forEach(k => allKeys.add(k));
}

const report = {
  missing_keys: {},
  extra_keys: {},
  placeholder_mismatches: [],
  stats: {}
};

for (const k of Array.from(allKeys).sort()) {
  const present = locales.filter(l => getValueByKey(data[l], k) !== undefined);
  if (present.length !== locales.length) {
    report.missing_keys[k] = locales.filter(l => !present.includes(l));
  }
  // placeholders
  const ph = {};
  for (const l of locales) {
    const val = getValueByKey(data[l], k);
    ph[l] = extractPlaceholders(val);
  }
  const uniq = new Set([].concat(...Object.values(ph)));
  if (uniq.size > 0) {
    // check equality
    const sets = Object.values(ph).map(a => a.sort().join('|'));
    const allEqual = sets.every(s => s === sets[0]);
    if (!allEqual) {
      report.placeholder_mismatches.push({ key: k, placeholders: ph });
    }
  }
}

// extras: keys present only in a locale (already in missing_keys). Compute counts
for (const l of locales) {
  const keys = collectKeys(data[l]);
  report.stats[l] = keys.length;
}

fs.writeFileSync(path.join(__dirname, 'i18n-audit-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log('Audit completed. Report written to scripts/i18n-audit-report.json');
console.log('Summary:');
console.log(`- locales: ${locales.join(', ')}`);
console.log(`- total distinct keys: ${Object.keys(report.missing_keys).length + (function(){let c=0; for (const l of locales) c+=report.stats[l]; return Math.max(...Object.values(report.stats));})()}`);
console.log(`- placeholder mismatches: ${report.placeholder_mismatches.length}`);
console.log('Run: node scripts/i18n-audit.js');
