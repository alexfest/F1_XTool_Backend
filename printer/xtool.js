const fs = require('fs');
const path = require('path');
const { generateTemplatePNG } = require('../utils/template');

async function printLabel(name, isFirstPrinting) {
  console.log("printing label...", name);
  await generateTemplatePNG(name, isFirstPrinting);
}

module.exports = { printLabel };