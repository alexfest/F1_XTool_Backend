const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { printLabel } = require('./printer/xtool');
const { readFontSettings, writeFontSettings } = require('./utils/settings');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory print queue
const printQueue = [];
let isPrinting = false;

async function processQueue() {
  if (isPrinting || printQueue.length === 0) return;

  isPrinting = true;
  const job = printQueue.shift();

  try {
    await printLabel(job.name);
    console.log(`✅ Printed label for ${job.name}`);
  } catch (error) {
    console.error(`❌ Failed to print label for ${job.name}`, error);
  }

  isPrinting = false;
  setTimeout(processQueue, 1000); // Wait 1s before next job
}

// GET current settings
app.get('/api/font-settings', (req, res) => {
  const settings = readFontSettings();
  res.json(settings);
});

// POST to update settings
app.post('/api/font-settings', (req, res) => {
  const { fontFamily, fontSize, x, y } = req.body;

  const settings = readFontSettings();

  if (typeof fontFamily === 'string') settings.fontFamily = fontFamily;
  if (typeof fontSize === 'number') settings.fontSize = fontSize;
  if (typeof x === 'number') settings.x = x;
  if (typeof y === 'number') settings.y = y;

  writeFontSettings(settings);

  res.json({ success: true, fontSettings: settings });
});

// API to add print job to queue
app.post('/api/print', async (req, res) => {
  const { first_name, second_name } = req.body;

  if (!first_name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  printQueue.push({ name: first_name });

  if(second_name)
    printQueue.push({name: second_name});
  processQueue();

  res.status(200).json({ message: 'Print job queued successfully' });
});

app.post('/api/print_excel', async (req, res) => {
  const { names } = req.body;

  if (!names) {
    return res.status(400).json({ message: 'Names is required' });
  }

  names.forEach(name => {
    printQueue.push({ name });
  });
  processQueue();

  res.status(200).json({ message: 'Print jobs queued successfully' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🖨️  Share A Coke backend running at http://localhost:${PORT}`);
});