const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- Running Node.js Gateway Unit Tests ---');

// Test 1: Data storage integrity
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

assert(fs.existsSync(DATA_DIR), 'Data directory should exist');
assert(fs.existsSync(HISTORY_FILE), 'History file should exist');
assert(fs.existsSync(FAVORITES_FILE), 'Favorites file should exist');

const favs = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
assert(Array.isArray(favs), 'Favorites should be an array');
assert(favs.length > 0, 'Favorites should have default entries');
console.log(`✓ Data store verified: ${favs.length} initial favorite pairs.`);

// Test 2: Verify package.json configuration
const pkg = require('../package.json');
assert.strictEqual(pkg.name, 'currency-converter-gateway');
console.log('✓ package.json metadata validated.');

console.log('All Node.js Gateway unit tests passed successfully!');
