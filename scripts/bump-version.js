#!/usr/bin/env node

/**
 * Version Bump Script
 * 
 * Bumps version in package.json and app.json
 * 
 * Usage:
 *   node scripts/bump-version.js patch|minor|major
 */

const fs = require('fs');
const path = require('path');

const versionType = process.argv[2] || 'patch';
const validTypes = ['patch', 'minor', 'major'];

if (!validTypes.includes(versionType)) {
  console.error(`Invalid version type: ${versionType}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update app.json
const appPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));
appJson.expo.version = newVersion;

// Increment iOS build number
const currentIosBuild = appJson.expo.ios?.buildNumber || '1';
appJson.expo.ios = {
  ...(appJson.expo.ios || {}),
  buildNumber: String(Number(currentIosBuild) + 1),
};

// Increment Android version code
const currentAndroidCode = appJson.expo.android?.versionCode || 1;
appJson.expo.android = {
  ...(appJson.expo.android || {}),
  versionCode: currentAndroidCode + 1,
};

fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✓ Version bumped: ${packageJson.version} → ${newVersion}`);
console.log(`✓ iOS build number: ${appJson.expo.ios.buildNumber}`);
console.log(`✓ Android version code: ${appJson.expo.android.versionCode}`);
