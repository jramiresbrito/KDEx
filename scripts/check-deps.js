#!/usr/bin/env node
/**
 * Dependency Security Checker for KDEx
 * Checks for known malicious packages and suspicious patterns
 */

import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Known malicious package versions from recent supply chain attacks
const KNOWN_MALICIOUS_PACKAGES = {
  'debug': ['4.4.2'],
  'chalk': ['5.6.1'],
  'ansi-styles': ['6.2.2'],
  'supports-color': ['10.2.1'],
  'strip-ansi': ['7.1.1'],
  'wrap-ansi': ['9.0.1'],
  'ansi-regex': ['6.2.1'],
  'color-convert': ['3.1.1'],
  'slice-ansi': ['7.1.1'],
  'color-name': ['2.0.1'],
  'is-arrayish': ['0.3.3'],
  'error-ex': ['1.3.3'],
  'color-string': ['2.1.1'],
  'simple-swizzle': ['0.2.3'],
  'has-ansi': ['6.0.1'],
  'supports-hyperlinks': ['4.1.1'],
  'chalk-template': ['1.1.1'],
  'backslash': ['0.2.1'],
  '@duckdb/node-api': ['1.3.3'],
  '@duckdb/duckdb-wasm': ['1.29.2'],
  '@duckdb/node-bindings': ['1.3.3'],
  'duckdb': ['1.3.3'],
  'proto-tinker-wc': ['0.1.87'],
  '@coveops/abi': ['2.0.1']
};

// Suspicious patterns in package names (typosquatting)
const SUSPICIOUS_PATTERNS = [
  /^reac[t]/i, // react typos
  /^loda[sh]/i, // lodash typos  
  /^momen[t]/i, // moment typos
  /^@types?\/reac[t]/i, // @types/react typos
  /^ethe?r[s]/i, // ethers typos
];

function checkPackageLock() {
  console.log('🔍 Checking package-lock.json for security issues...\n');
  
  try {
    const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    let hasIssues = false;
    let warnings = 0;

    // Check for known malicious packages
    console.log('📋 Scanning for known malicious packages...');
    for (const [packageName, maliciousVersions] of Object.entries(KNOWN_MALICIOUS_PACKAGES)) {
      const packagePath = `node_modules/${packageName}`;
      if (packageLock.packages && packageLock.packages[packagePath]) {
        const currentVersion = packageLock.packages[packagePath].version;
        if (maliciousVersions.includes(currentVersion)) {
          console.log(`❌ CRITICAL: Found malicious package ${packageName}@${currentVersion}`);
          hasIssues = true;
        } else {
          console.log(`✅ ${packageName}@${currentVersion} - safe version`);
        }
      }
    }

    // Check for suspicious package names (typosquatting)
    console.log('\n🎯 Scanning for potential typosquatting...');
    if (packageLock.packages) {
      for (const packagePath of Object.keys(packageLock.packages)) {
        if (packagePath.startsWith('node_modules/')) {
          const packageName = packagePath.replace('node_modules/', '');
          
          for (const pattern of SUSPICIOUS_PATTERNS) {
            if (pattern.test(packageName) && !isKnownGoodPackage(packageName)) {
              console.log(`⚠️  WARNING: Potentially suspicious package name: ${packageName}`);
              warnings++;
            }
          }
        }
      }
    }

    // Check package integrity and source
    console.log('\n🔐 Checking package integrity...');
    let integrityChecked = 0;
    if (packageLock.packages) {
      for (const [path, pkg] of Object.entries(packageLock.packages)) {
        if (path.startsWith('node_modules/') && pkg.integrity) {
          integrityChecked++;
        }
      }
    }
    
    console.log(`✅ ${integrityChecked} packages have integrity hashes`);

    // Summary
    console.log('\n' + '='.repeat(50));
    if (hasIssues) {
      console.log('❌ SECURITY ISSUES FOUND! Please review and take action.');
      process.exit(1);
    } else if (warnings > 0) {
      console.log(`⚠️  ${warnings} warnings found. Please review suspicious packages.`);
      process.exit(0);
    } else {
      console.log('✅ No security issues detected in dependencies.');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error reading package-lock.json:', error.message);
    process.exit(1);
  }
}

function isKnownGoodPackage(packageName) {
  const knownGood = [
    'react', 'react-dom', 'react-redux', 'react-apexcharts', 'react-blockies', 'react-is', 'react-refresh',
    'lodash', 'lodash.camelcase', 'lodash.clonedeep', 'lodash.isequal', 'lodash.merge', 'lodash.truncate',
    'moment', 'ethers', '@types/react', '@types/react-dom', '@types/node', 'undici-types'
  ];
  return knownGood.includes(packageName);
}

// Run the check
checkPackageLock();
