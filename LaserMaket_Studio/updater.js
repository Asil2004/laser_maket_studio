/**
 * LaserMaket Studio Auto-Sync & Internet Updater Engine
 * Multi-computer synchronization across the Internet and local networks.
 * Keeps all 4 computers updated without reinstalling Setup.exe or creating duplicates.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

class LaserMaketUpdater {
  constructor() {
    const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'AppData', 'Local');
    const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';

    this.workspaceDir = path.resolve(__dirname);
    this.downloadsDir = path.join(userProfile, 'Downloads');
    this.configFile = path.join(this.workspaceDir, 'updater-config.json');

    this.config = this.loadConfig();

    this.installedAppDirs = [
      path.join(localAppData, 'Programs', 'LaserMaket Studio', 'resources', 'app', 'site'),
      path.join(localAppData, 'Programs', 'LaserMaket'),
      path.join(localAppData, 'Programs', 'LaserMaket Studio')
    ];
  }

  log(msg) {
    console.log(`[LaserMaket Updater]: ${msg}`);
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }
    } catch (e) {}
    return {
      currentVersion: '1.0.80',
      updateManifestUrl: 'https://raw.githubusercontent.com/Asil2004/laser_maket_studio/main/dist_update/manifest.json',
      autoCheckOnStartup: true,
      lastChecked: ''
    };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (e) {}
  }

  /**
   * Recursively copies updated files from src to dest
   */
  copyDirRecursive(src, dest, stats = { copied: 0, skipped: 0 }) {
    if (!fs.existsSync(src)) return stats;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirRecursive(srcPath, destPath, stats);
      } else if (entry.isFile()) {
        let shouldCopy = true;
        if (fs.existsSync(destPath)) {
          const srcStat = fs.statSync(srcPath);
          const destStat = fs.statSync(destPath);
          if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size === srcStat.size) {
            shouldCopy = false;
          }
        }

        if (shouldCopy) {
          fs.copyFileSync(srcPath, destPath);
          stats.copied++;
        } else {
          stats.skipped++;
        }
      }
    }
    return stats;
  }

  /**
   * Synchronizes local workspace files into installed app directories
   */
  syncToInstalledApps() {
    const results = [];
    const sourceDir = this.workspaceDir;

    if (!fs.existsSync(sourceDir)) {
      return { success: false, error: 'Source directory not found' };
    }

    for (const targetDir of this.installedAppDirs) {
      try {
        if (!fs.existsSync(path.dirname(targetDir))) continue;
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const stats = { copied: 0, skipped: 0 };

        const srcIndex = path.join(sourceDir, 'index.html');
        if (fs.existsSync(srcIndex)) {
          const destIndex = path.join(targetDir, 'index.html');
          fs.copyFileSync(srcIndex, destIndex);
          stats.copied++;
        }

        const srcTools = path.join(sourceDir, 'tools');
        const destTools = path.join(targetDir, 'tools');
        this.copyDirRecursive(srcTools, destTools, stats);

        const srcVendor = path.join(sourceDir, 'vendor');
        const destVendor = path.join(targetDir, 'vendor');
        if (fs.existsSync(srcVendor)) {
          this.copyDirRecursive(srcVendor, destVendor, stats);
        }

        // Copy config
        if (fs.existsSync(this.configFile)) {
          fs.copyFileSync(this.configFile, path.join(targetDir, 'updater-config.json'));
        }

        results.push({
          target: targetDir,
          status: 'synced',
          copied: stats.copied,
          skipped: stats.skipped
        });
        this.log(`Yangilandi: ${targetDir} (${stats.copied} ta fayl yangilandi)`);
      } catch (err) {
        results.push({
          target: targetDir,
          status: 'error',
          error: err.message
        });
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      results
    };
  }

  /**
   * Helper to fetch JSON from remote URL (supports http and https)
   */
  fetchJson(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { timeout: 6000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return this.fetchJson(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Server javobi: ${res.statusCode}`));
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('JSON formati noto\'g\'ri'));
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Ulanish vaqti tugadi (timeout)'));
      });
    });
  }

  /**
   * Helper to download file from remote URL
   */
  downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(destPath);
      const req = client.get(url, { timeout: 15000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(destPath);
          return this.downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          return reject(new Error(`Yuklab olishda xato: ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      });
      req.on('error', (err) => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
      req.on('timeout', () => {
        req.destroy();
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(new Error('Yuklab olish vaqti tugadi'));
      });
    });
  }

  /**
   * Check for update over the Internet across all 4 computers
   */
  async checkInternetUpdate() {
    this.log(`Internet orqali yangilanish tekshirilmoqda: ${this.config.updateManifestUrl}`);
    try {
      const manifest = await this.fetchJson(this.config.updateManifestUrl);
      this.config.lastChecked = new Date().toISOString();
      this.saveConfig();

      if (!manifest || !manifest.version) {
        return { hasUpdate: false, message: 'Manifest topilmadi' };
      }

      const hasNewVersion = this.compareVersions(manifest.version, this.config.currentVersion) > 0;
      if (!hasNewVersion) {
        this.log(`Dastur eng so'nggi versiyada (${this.config.currentVersion}).`);
        return { hasUpdate: false, currentVersion: this.config.currentVersion, latestVersion: manifest.version };
      }

      this.log(`Yangi versiya aniqlandi: ${manifest.version} (Hozirgi: ${this.config.currentVersion})`);

      // If manifest specifies zip download
      if (manifest.downloadUrl) {
        const tempZip = path.join(process.env.TEMP || '.', `lasermaket_update_${manifest.version}.zip`);
        this.log(`Yuklab olinmoqda: ${manifest.downloadUrl}`);
        await this.downloadFile(manifest.downloadUrl, tempZip);
        this.log(`Yuklab olindi. O'rnatilmoqda...`);

        // Extract to target app directories
        for (const targetDir of this.installedAppDirs) {
          if (!fs.existsSync(path.dirname(targetDir))) continue;
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

          try {
            execSync(`tar -xf "${tempZip}" -C "${targetDir}"`, { stdio: 'ignore' });
            this.log(`Yangilandi: ${targetDir}`);
          } catch (e) {
            this.log(`Chiqarishda xatolik: ${e.message}`);
          }
        }

        // Clean temp zip
        try { fs.unlinkSync(tempZip); } catch (e) {}

        this.config.currentVersion = manifest.version;
        this.saveConfig();

        return {
          hasUpdate: true,
          applied: true,
          version: manifest.version,
          releaseNotes: manifest.releaseNotes || 'LaserMaket Studio yangilandi'
        };
      }

      return { hasUpdate: true, applied: false, version: manifest.version };
    } catch (err) {
      this.log(`Internet tekshiruvi xatosi (oflayn bo'lishi mumkin): ${err.message}`);
      // Fallback: sync from local files
      const localSync = this.syncToInstalledApps();
      return { hasUpdate: false, localFallback: localSync, error: err.message };
    }
  }

  /**
   * Version comparison: 1.0.80 > 1.0.79 -> returns 1
   */
  compareVersions(v1, v2) {
    const parts1 = (v1 || '0').split('.').map(Number);
    const parts2 = (v2 || '0').split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  /**
   * Publishes a new update package (update.zip + manifest.json)
   * Run when you or Claude makes changes!
   */
  publishUpdate(newVersion = null, releaseNotes = '') {
    if (!newVersion) {
      const parts = this.config.currentVersion.split('.');
      parts[parts.length - 1] = parseInt(parts[parts.length - 1] || 0, 10) + 1;
      newVersion = parts.join('.');
    }

    const distDir = path.join(this.workspaceDir, 'dist_update');
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    const zipPath = path.join(distDir, 'update.zip');
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

    this.log(`Yangi yangilanish to'plami tayyorlanmoqda: ${newVersion}...`);

    // Create zip of index.html, tools, updater-config.json
    try {
      execSync(`tar -a -cf "${zipPath}" index.html tools updater-config.json`, {
        cwd: this.workspaceDir,
        stdio: 'inherit'
      });
    } catch (e) {
      this.log(`Zip yaratishda xato: ${e.message}`);
      return { success: false, error: e.message };
    }

    const manifest = {
      version: newVersion,
      updatedAt: new Date().toISOString(),
      downloadUrl: `https://raw.githubusercontent.com/Asil2004/laser_maket_studio/main/dist_update/update.zip`,
      releaseNotes: releaseNotes || `LaserMaket Studio ${newVersion} yangilanishi`,
      requiredAppVersion: "1.0.75"
    };

    const manifestPath = path.join(distDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    // Also update root manifest
    fs.writeFileSync(path.join(this.workspaceDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    this.config.currentVersion = newVersion;
    this.saveConfig();

    // Also sync locally
    this.syncToInstalledApps();

    this.log(`Yangilanish tayyor:`);
    this.log(`1. Zip: ${zipPath}`);
    this.log(`2. Manifest: ${manifestPath}`);

    return {
      success: true,
      version: newVersion,
      zipPath,
      manifestPath,
      manifest
    };
  }
}

module.exports = LaserMaketUpdater;

if (require.main === module) {
  const updater = new LaserMaketUpdater();
  const args = process.argv.slice(2);
  const cmd = args[0] || 'check';

  if (cmd === 'publish') {
    const ver = args[1];
    const notes = args.slice(2).join(' ');
    const res = updater.publishUpdate(ver, notes);
    console.log(JSON.stringify(res, null, 2));
  } else if (cmd === 'internet') {
    updater.checkInternetUpdate().then(res => {
      console.log(JSON.stringify(res, null, 2));
    });
  } else {
    const res = updater.syncToInstalledApps();
    console.log(JSON.stringify(res, null, 2));
  }
}
