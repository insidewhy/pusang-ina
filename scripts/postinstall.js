#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const VERSION = PACKAGE_JSON.version;
const REPO = 'insidewhy/pusang-ina'; // Update this with your GitHub username

function getPlatformTarget() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'linux') {
    try {
      execSync('ldd --version 2>&1 | grep musl', { stdio: 'ignore' });
      return 'linux-musl';
    } catch {
      return 'linux-glibc';
    }
  } else if (platform === 'darwin') {
    return arch === 'arm64' ? 'macos-arm64' : 'macos-x64';
  } else if (platform === 'win32') {
    return 'windows';
  }

  throw new Error(`Unsupported platform: ${platform} ${arch}`);
}

function getFileExtension() {
  if (process.platform === 'win32') return '.dll';
  if (process.platform === 'darwin') return '.dylib';
  return '.so';
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  try {
    const target = getPlatformTarget();
    const ext = getFileExtension();
    const libDir = path.join(__dirname, '..', 'lib');

    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }

    const modules = ['scss', 'vue'];

    for (const module of modules) {
      const releaseFileName = `${module}-${target}${ext}`;
      const downloadUrl = `https://github.com/${REPO}/releases/download/v${VERSION}/${releaseFileName}`;
      const destPath = path.join(libDir, `${module}.so`);

      console.log(`Downloading ${releaseFileName}...`);

      try {
        await downloadFile(downloadUrl, destPath);
        fs.chmodSync(destPath, 0o755);
        console.log(`✓ Downloaded ${module}.so`);
      } catch (error) {
        console.error(`Failed to download ${releaseFileName}:`, error.message);
        process.exit(1);
      }
    }

    // Update sgconfig.yml for Windows and macOS
    const sgconfigPath = path.join(__dirname, '..', 'sgconfig.yml');
    if (fs.existsSync(sgconfigPath)) {
      if (process.platform === 'win32') {
        let content = fs.readFileSync(sgconfigPath, 'utf8');
        content = content.replace(/\.so/g, '.dll');
        fs.writeFileSync(sgconfigPath, content);
        console.log('✓ Updated sgconfig.yml for Windows (.so -> .dll)');
      } else if (process.platform === 'darwin') {
        let content = fs.readFileSync(sgconfigPath, 'utf8');
        content = content.replace(/\.so/g, '.dylib');
        fs.writeFileSync(sgconfigPath, content);
        console.log('✓ Updated sgconfig.yml for macOS (.so -> .dylib)');
      }
    }

    console.log('All modules downloaded successfully!');
  } catch (error) {
    console.error('Error during postinstall:', error.message);
    process.exit(1);
  }
}

main();
