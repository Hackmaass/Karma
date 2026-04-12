const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace hardcoded base hexes with semantic names
  content = content.replace(/\[#FAFAFA\]/g, 'page-bg');
  content = content.replace(/\[#111111\]/g, 'page-text');
  content = content.replace(/\[#141414\]/g, 'page-bg'); // just in case it was left over
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx')) {
      processFile(filePath);
    }
  }
}

walkDir(path.join(__dirname, '../src'));
