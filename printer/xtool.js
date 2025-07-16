const fs = require('fs');
const path = require('path');
const { generateTemplatePNG } = require('../utils/template');

async function printLabel(name) {
  console.log("printing label...", name);
  await generateTemplatePNG(name);
}

module.exports = { printLabel };