const fs = require('fs');
const path = require('path');
const printer = require('printer');
const { generateZPL } = require('../utils/zplTemplate');

// Get the list of all printers
const printers = printer.getPrinters();
// Try to find a Zebra printer by name
const zebraPrinter = printers.find(p => p.name.toLowerCase().includes('zebra'));

if (!zebraPrinter) {
  console.error('No Zebra printer found.');
  // process.exit(1);
}

async function printLabel(name) {
  const zplData = await generateZPL(name.toUpperCase());

  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `${name}-label.zpl`);
  fs.writeFileSync(outputFile, zplData);

  console.log(`ZPL Generated for ${name} successfully:\n`);

  // Send ZPL command to the Zebra printer
  if(zebraPrinter) {
    printer.printDirect({
      data: zplData,
      printer: zebraPrinter.name,
      type: 'RAW', // RAW is required for Zebra ZPL
      success: function (jobID) {
        console.log(`ZPL sent to printer '${zebraPrinter.name}' with job ID ${jobID}`);
      },
      error: function (err) {
        console.error('Failed to print ZPL:', err);
      }
    });
  }
}

module.exports = { printLabel };