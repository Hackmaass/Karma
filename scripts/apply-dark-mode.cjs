const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const initialContent = content;

  // 1. Basic Backgrounds
  content = content.replace(/(?<!dark:)\bbg-white\b/g, 'bg-white dark:bg-[#141414]');
  content = content.replace(/(?<!dark:)\bbg-\[\#FAFAFA\]\b/g, 'bg-[#FAFAFA] dark:bg-[#0A0A0A]');

  // 2. Primary text "black" and fractions
  // exclude selection:text-black and dark:text-black
  content = content.replace(/(?<!(?:selection:|dark:|text-white\sdark:))\btext-black(?![\/a-zA-Z0-9\-])/g, 'text-black dark:text-white');
  content = content.replace(/(?<!(?:selection:|dark:))\btext-\[\#111111\]\b/g, 'text-[#111111] dark:text-white');
  
  // Opacities text-black/60 -> dark:text-white/60
  content = content.replace(/(?<!dark:)\btext-black\/([0-9]+)\b/g, 'text-black/$1 dark:text-white/$1');
  
  // 3. Borders 
  content = content.replace(/(?<!dark:)\bborder-black\/\[([0-9\.]+)\]\b/g, 'border-black/[$1] dark:border-white/[$1]');
  content = content.replace(/(?<!dark:)\bborder-black\b(?![\/a-zA-Z0-9\-])/g, 'border-black dark:border-white/20');
  
  // 4. Subtle background fractions often used for surfaces or hovers
  content = content.replace(/(?<!dark:|hover:)\bbg-black\/\[([0-9\.]+)\]\b/g, 'bg-black/[$1] dark:bg-white/[$1]');
  content = content.replace(/(?<!dark:)\bhover:bg-black\/\[([0-9\.]+)\]\b/g, 'hover:bg-black/[$1] dark:hover:bg-white/[$1]');
  content = content.replace(/(?<!dark:|hover:)\bbg-black\/([0-9]+)\b(?!\])/g, 'bg-black/$1 dark:bg-white/$1');
  content = content.replace(/(?<!dark:)\bhover:bg-black\/([0-9]+)\b(?!\])/g, 'hover:bg-black/$1 dark:hover:bg-white/$1');

  // 5. Inverted interactive elements (black buttons)
  content = content.replace(/(?<!dark:)\bbg-black text-white\b/g, 'bg-black text-white dark:bg-white dark:text-black');
  
  // 6. Selection colors inside wrapper bg-[#FAFAFA] text-[#111111] font-sans selection:bg-black selection:text-white
  content = content.replace(/(?<!dark:)\bselection:bg-black selection:text-white\b/g, 'selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black');

  if (content !== initialContent) {
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
