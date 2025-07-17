const puppeteer = require('puppeteer');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { runAppleScriptForName } = require('./appleScript');
const { readFontSettings } = require('./settings');

async function renderTextWithScreenshot(fontFamily, fontSize, canvasWidth, canvasHeight, name) {
    console.log('renderTextWithScreenshot... ', fontFamily, fontSize, name);
  // const isArabic = /[\u0600-\u06FF]/.test(name); // check if Arabic letters are present
  // const fontFamily = isArabic ? 'Tajawal' : 'Coke';
  // const fontOutlineFamily = isArabic ? 'Tajawal' : 'Coke Outline';
  const isCokeFont = fontFamily === 'Coke R';

  const html = `
    <html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>Arabic Outline Text</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      background: white;
      font-size: ${fontSize}px;
      width: ${canvasWidth}px;
      height: ${canvasHeight}px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .rotated-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .text-outline, .text-fill {
      font-size: ${fontSize}px;
      position: absolute;
      top: 50%;
      right: 50%;
      transform: translate(50%, -50%);
    }

    .text-outline {
      font-family: 'Coke Outline', sans-serif;
      -webkit-text-stroke: ${!isCokeFont ? 3 : 0}px;
      color: black;
      z-index: 1;
    }

    .text-fill {
      font-family: '${fontFamily}', sans-serif;
      color: white;
      z-index: 2;
    }

    .text-normal-outline {
      color: white;
      font-family: '${fontFamily}', sans-serif;
      text-align: center;
      direction: rtl;
      text-shadow:
        -4px -4px 0 black,
         4px -4px 0 black,
        -4px  4px 0 black,
         4px  4px 0 black,
         0px  4px 0 black,
         4px  0px 0 black,
         0px -4px 0 black,
        -4px  0px 0 black;
    }
  </style>
</head>
<body>
  <div class="rotated-container">
    <div class="${!isCokeFont ? 'text-normal-outline' : 'text-outline'}"> ${name}</div>
    <div class="text-fill">${!isCokeFont ? '': name}</div>
  </div>
  
</body>
</html>


  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: canvasWidth,
      height: canvasHeight,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();
  await page.goto('data:text/html,' + encodeURIComponent(html), { waitUntil: 'networkidle0' });

  const screenshot = await page.screenshot({ omitBackground: false });
  await browser.close();

  // Optional: save preview image
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true }); // create directory if it doesn't exist
  }

  const timestamp = new Date().toISOString()
  .replace(/[-T:]/g, '')
  .split('.')[0]; // removes milliseconds and timezone
  const formatted = `${timestamp.slice(0, 8)}_${timestamp.slice(8)}`;
  const real_filename = `${formatted}_${name}`;
  

  const outputPath = path.join(outputDir, `${real_filename}.png`);
  fs.writeFileSync(outputPath, screenshot);

  // Parse screenshot as PNG and extract RGBA data
  // const png = PNG.sync.read(screenshot);
  // const rgbaData = png.data; // This is a Buffer in RGBA format (Uint8Array)

  return real_filename;
}

async function generateTemplatePNG(name) {
  try {
    const settings = readFontSettings();
    const fontSize = parseInt(settings.fontSize);
    const fontFamily = settings.fontFamily;
    const originX = parseInt(settings.x);
    const originY = parseInt(settings.y);
    const margin = 30;

    
    // Temporary canvas to measure text
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${fontSize}px "${fontFamily}"`;
    
    const textMetrics = tempCtx.measureText(name);
    const textWidth = textMetrics.width;
    const textHeight = fontSize * 1.2; // approximate height with line spacing
    
    const canvasWidth = Math.ceil(textWidth + margin * 2);
    const canvasHeight = Math.ceil(textHeight + margin * 2);
    
    const real_filename = await renderTextWithScreenshot(fontFamily, fontSize, canvasWidth, canvasHeight, name);
    runAppleScriptForName(real_filename)
    .then(output => console.log("Success:", output))
    .catch(err => console.error("Error:", err));


  } catch (error) {
    console.log(error);
  }
  return "";
}

module.exports = { generateTemplatePNG };