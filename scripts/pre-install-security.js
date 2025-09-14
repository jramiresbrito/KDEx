#!/usr/bin/env node
/**
 * Pre-install Security Hook for KDEx
 * Runs before any package installation to verify security requirements
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔒 Running pre-install security checks...\n');

function checkNodeVersion() {
  const requiredNodeVersion = '18.0.0';
  const currentVersion = process.version.slice(1); // Remove 'v' prefix

  console.log(`📋 Node.js version: ${currentVersion}`);

  const [reqMajor, reqMinor] = requiredNodeVersion.split('.').map(Number);
  const [curMajor, curMinor] = currentVersion.split('.').map(Number);

  if (curMajor < reqMajor || (curMajor === reqMajor && curMinor < reqMinor)) {
    console.log(`❌ Node.js ${currentVersion} is below required ${requiredNodeVersion}`);
    process.exit(1);
  }

  console.log('✅ Node.js version meets requirements');
}

function checkNpmVersion() {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const requiredNpmVersion = 10;
    const currentMajor = parseInt(npmVersion.split('.')[0]);

    console.log(`📋 npm version: ${npmVersion}`);

    if (currentMajor < requiredNpmVersion) {
      console.log(`❌ npm ${npmVersion} is below required ${requiredNpmVersion}.x`);
      process.exit(1);
    }

    console.log('✅ npm version meets requirements');
  } catch (error) {
    console.log('❌ Could not check npm version');
    process.exit(1);
  }
}

function checkPackageLockExists() {
  if (!fs.existsSync('package-lock.json')) {
    console.log('❌ package-lock.json is missing. This is required for security.');
    console.log('   Run: npm install to generate it');
    process.exit(1);
  }
  console.log('✅ package-lock.json exists');
}

function checkForSuspiciousInstalls() {
  // Check if we're installing any packages that match known attack patterns
  const args = process.argv.slice(2);
  if (args.length === 0) return;

  const suspiciousPatterns = [
    /debug@4\.4\.2/,
    /chalk@5\.6\.1/,
    /ansi-styles@6\.2\.2/,
    // Add more patterns as needed
  ];

  for (const arg of args) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(arg)) {
        console.log(`❌ BLOCKED: Attempting to install known malicious package: ${arg}`);
        console.log('   This matches a known supply chain attack pattern.');
        process.exit(1);
      }
    }
  }
}

function warnAboutDangerousCommands() {
  const args = process.argv.slice(2);
  const dangerousFlags = ['--force', '-f', '--ignore-scripts'];

  for (const arg of args) {
    if (dangerousFlags.includes(arg)) {
      console.log(`⚠️  WARNING: Using potentially dangerous flag: ${arg}`);
      console.log('   This bypasses security checks. Proceed with caution.');
    }
  }
}

function main() {
  try {
    checkNodeVersion();
    checkNpmVersion();
    checkPackageLockExists();
    checkForSuspiciousInstalls();
    warnAboutDangerousCommands();

    console.log('\n🔒 Pre-install security checks passed\n');
  } catch (error) {
    console.error('❌ Pre-install security check failed:', error.message);
    process.exit(1);
  }
}

main();
