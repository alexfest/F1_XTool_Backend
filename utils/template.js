const puppeteer = require('puppeteer');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { runAppleScriptForName } = require('./appleScript');
const { readFontSettings } = require('./settings');

async function renderTextWithScreenshot(fontPath, fontOutlinePath, outputDir, fontSize, canvasWidth, canvasHeight, name) {
   // Step 1: Read and encode font file
   const fontData = fs.readFileSync(fontPath);
   const fontOutlineData = fs.readFileSync(fontOutlinePath);
   const fontBase64 = fontData.toString('base64');
   const fontOutlineBase64 = fontOutlineData.toString('base64');

   const fontFamily = "test";
   const fontOutlineFamily = "testOutline";
 
   // Step 2: Sanitize name
   const escapedName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
 
   // Step 3: Build SVG
   const svg = `
 <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
   <defs>
     <style type="text/css">
       @font-face {
         font-family: '${fontFamily}';
         src: url('data:font/ttf;base64,${fontBase64}') format('truetype');
       }
       @font-face {
         font-family: '${fontOutlineFamily}';
         src: url('data:font/ttf;base64,${fontOutlineBase64}') format('truetype');
       }
       .outline {
        font-family: '${fontOutlineFamily}';
        font-size: 150px;
        text-anchor: middle;
        dominant-baseline: middle;
        stroke: black;
        stroke-width: 3px;
        fill: black;
      }

      .fill {
        font-family: '${fontFamily}';
        font-size: 150px;
        text-anchor: middle;
        dominant-baseline: middle;
        fill: white;
      }
     </style>
   </defs>
     <!-- Draw outline first -->
    <text x="50%" y="50%" class="outline">${escapedName}</text>

    <!-- Draw fill on top -->
    <text x="50%" y="50%" class="fill">${escapedName}</text>
 </svg>
 `;
 
   // Step 4: Save SVG
   if (!fs.existsSync(outputDir)) {
     fs.mkdirSync(outputDir, { recursive: true });
   }
 
   const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
   const formattedName = `${timestamp}_${name.replace(/\s+/g, '_')}.svg`;
 
   const outputPath = path.join(outputDir, formattedName);
   fs.writeFileSync(outputPath, svg);
   console.log(`✅ SVG saved at: ${outputPath}`);
 
   return outputPath;
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

    const fontPath = path.join(__dirname, '../public/Coke-Regular.ttf'); // Your font file
    const fontOutlinePath = path.join(__dirname, '../public/Coke-Outline.ttf'); // Your font file
    const outputDir = path.join(__dirname, '../output');
    
    const real_filename = await renderTextWithScreenshot(fontPath, fontOutlinePath, outputDir, fontSize, canvasWidth, canvasHeight, name);
    runAppleScriptForName(real_filename, name)
    .then(output => console.log("Success:", output))
    .catch(err => console.error("Error:", err));


  } catch (error) {
    console.log(error);
  }
  return "";
}

module.exports = { generateTemplatePNG };