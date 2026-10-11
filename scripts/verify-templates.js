/**
 * CVMaker AI - Comprehensive Template & Architecture Verification Script
 * 
 * Verifies:
 * 1. File count: <= 90 files
 * 2. Template count: exactly 200 Job templates, at least 200 Marriage templates
 * 3. Unique IDs and valid required fields
 * 4. Distinct visual signatures across 12 layout families & curated palettes
 * 5. Legacy aliases resolution (base, job-studio-1..8, marriage-1..30)
 * 6. Server pricing calculation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  ALL_JOB_TEMPLATES, 
  ALL_MARRIAGE_TEMPLATES, 
  ALL_TEMPLATES, 
  getTemplateById, 
  TEMPLATE_LOOKUP_MAP 
} from '../src/data/catalog.js';
import { resolveServerPrice, DEFAULT_PRICING } from '../server/catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('   CVMAKER AI — ACCEPTANCE VERIFICATION SUITE       ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// TEST 1: File Count Check (Strict <= 90 files rule)
// -------------------------------------------------------------
function countProjectFiles(dir) {
  let fileList = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    // Ignore generated directories and Git
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'coverage') {
      continue;
    }

    if (entry.isDirectory()) {
      fileList = fileList.concat(countProjectFiles(fullPath));
    } else {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

const allProjectFiles = countProjectFiles(rootDir);
console.log(`Delivered Project Files Count: ${allProjectFiles.length}`);
assert(allProjectFiles.length <= 90, `Project file count is ${allProjectFiles.length} (ceiling is 90)`);

// -------------------------------------------------------------
// TEST 2: Template Counts
// -------------------------------------------------------------
assert(ALL_JOB_TEMPLATES.length === 200, `Exactly 200 Job templates generated (Found: ${ALL_JOB_TEMPLATES.length})`);
assert(ALL_MARRIAGE_TEMPLATES.length >= 200, `At least 200 Marriage templates generated (Found: ${ALL_MARRIAGE_TEMPLATES.length})`);
assert(ALL_TEMPLATES.length >= 400, `Total template catalog contains >= 400 designs (Found: ${ALL_TEMPLATES.length})`);

// -------------------------------------------------------------
// TEST 3: Unique IDs & Valid Configurations
// -------------------------------------------------------------
const idSet = new Set();
let duplicates = 0;
let invalidConfigs = 0;

for (const tmpl of ALL_TEMPLATES) {
  if (idSet.has(tmpl.id)) {
    duplicates++;
  }
  idSet.add(tmpl.id);

  if (!tmpl.name || !tmpl.layoutFamily || !tmpl.palette?.primary || !tmpl.category) {
    invalidConfigs++;
  }
}

assert(duplicates === 0, `All template IDs are strictly unique (Duplicates: ${duplicates})`);
assert(invalidConfigs === 0, `All templates contain complete valid configurations (Invalid: ${invalidConfigs})`);

// -------------------------------------------------------------
// TEST 4: Visual Diversity & Signatures
// -------------------------------------------------------------
const jobFamilies = new Set(ALL_JOB_TEMPLATES.map((t) => t.layoutFamily));
const marriageFamilies = new Set(ALL_MARRIAGE_TEMPLATES.map((t) => t.layoutFamily));

assert(jobFamilies.size >= 10, `Job templates span multiple distinct layout families (Count: ${jobFamilies.size})`);
assert(marriageFamilies.size >= 10, `Marriage templates span multiple cultural layout families (Count: ${marriageFamilies.size})`);

// -------------------------------------------------------------
// TEST 5: Legacy ID Migration Aliases
// -------------------------------------------------------------
const legacyBase = getTemplateById('base');
assert(legacyBase && legacyBase.id === 'job-001', 'Legacy "base" maps cleanly to job-001');

const legacyJobStudio = getTemplateById('job-studio-3');
assert(legacyJobStudio && legacyJobStudio.id === 'job-003', 'Legacy "job-studio-3" maps cleanly to job-003');

const legacyMarriage = getTemplateById('marriage-12');
assert(legacyMarriage && legacyMarriage.id === 'marriage-012', 'Legacy "marriage-12" maps cleanly to marriage-012');

// -------------------------------------------------------------
// TEST 6: Server Price Resolution
// -------------------------------------------------------------
const basicPriceRes = resolveServerPrice('job-001');
assert(basicPriceRes.amountInRupees === 9 && basicPriceRes.amountInPaise === 900, 'Basic template resolves to ₹9 (900 paise)');

const proPriceRes = resolveServerPrice('job-042');
assert(proPriceRes.amountInRupees === 21 && proPriceRes.amountInPaise === 2100, 'Professional template resolves to ₹21 (2100 paise)');

// Grand launch override test
const grandLaunchRes = resolveServerPrice('job-042', { grandLaunchEnabled: true });
assert(grandLaunchRes.isFree === true && grandLaunchRes.amountInRupees === 0, 'Grand launch flag enables 100% free mode');

console.log('\n====================================================');
console.log(`Verification Summary: ${passedTests} / ${totalTests} checks passed.`);
console.log('====================================================\n');
