const fs = require('fs');
const path = require('path');

// Store the settings in a writable location
const settingsPath = path.join(process.cwd(), 'public', 'font-settings.json');

// Utility to read settings from JSON file
function readFontSettings() {
  if (!fs.existsSync(settingsPath)) {
    // Default values if file doesn't exist
    const defaultSettings = { fontFamily: 'Coke', fontSize: 100, x: 122, y: 1870 };

    // Ensure directory exists
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  }

  const data = fs.readFileSync(settingsPath, 'utf-8');
  return JSON.parse(data);
}

// Utility to write settings to JSON file
function writeFontSettings(settings) {
  // Ensure directory exists
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

module.exports = { readFontSettings, writeFontSettings };
