const puppeteer = require('puppeteer');
const { createCanvas } = require('canvas');
const rgbaToZ64 = require('zpl-image').rgbaToZ64;
const fs = require('fs');
const { PNG } = require('pngjs');
const { readFontSettings } = require('./settings');

async function renderTextWithScreenshot(fontFamily, fontSize, canvasWidth, canvasHeight, name) {
  // const isArabic = /[\u0600-\u06FF]/.test(name); // check if Arabic letters are present
  // const fontFamily = isArabic ? 'Tajawal' : 'Coke';
  // const fontOutlineFamily = isArabic ? 'Tajawal' : 'Coke Outline';
  const isCokeFont = fontFamily === 'Coke';

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
      transform: rotate(-90deg);
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
  // fs.writeFileSync('./preview_arabic.png', screenshot);

  // Parse screenshot as PNG and extract RGBA data
  const png = PNG.sync.read(screenshot);
  const rgbaData = png.data; // This is a Buffer in RGBA format (Uint8Array)

  return {rgbaData};
}

async function generateZPL(name) {
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
    
    const {rgbaData} = await renderTextWithScreenshot(fontFamily, fontSize, canvasHeight, canvasWidth, name);

    /*
    // 👉 Create a rotated canvas (swap width and height)
    const canvas = createCanvas(canvasHeight, canvasWidth);
    const ctx = canvas.getContext('2d');

    // Rotate -90 degrees (counter-clockwise)
    ctx.translate(0, canvasWidth); // move origin to bottom-left corner
    ctx.rotate(-Math.PI / 2);      // rotate CCW
    
    // Fill background white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Coordinates to center the text
    const x = (canvasWidth - textWidth) / 2;
    const y = (canvasHeight + fontSize * 0.8) / 2; // approx. baseline adjustment

    // Draw outline
    ctx.font = `${fontSize}px "Coke Outline"`;
    ctx.fillStyle = 'black';
    ctx.fillText(name, x, y);

    // Draw fill on top
    ctx.font = `${fontSize}px "Coke"`;
    ctx.fillStyle = 'white';
    ctx.fillText(name, x, y);

    // Save PNG if needed
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./sam_outline.png', buffer); // Optional for debugging
    const imageData = ctx.getImageData(0, 0, canvasHeight, canvasWidth);
    const rgbaBuffer = imageData.data; // Uint8ClampedArray (RGBA format)
    */

    // Convert to Z64 format
    const res = rgbaToZ64(rgbaData, canvasHeight, { black: 50 });

    // Full ZPL command to send to the printer
    const xx = originX; // X position on label
    const yy = originY - textWidth / 2; // Y position on label

    const zpl = `
    ^XA
    ^FO${xx},${yy}
    ^GFA,${res.length},${res.length},${res.rowlen},${res.z64}
    ^XZ
    `.trim();
    
    return zpl;
  } catch (error) {
    console.log(error);
  }
  return "";
}

module.exports = { generateZPL };