const fs = require('fs');
const path = require('path');

async function printLabel(name) {
  console.log("printing label...", name);
}

module.exports = { printLabel };