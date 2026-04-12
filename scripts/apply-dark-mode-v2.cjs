const fs = require('fs');
const path = require('path');

// Simple dictionary for direct matches
const directMap = {
  'bg-white': 'dark:bg-[#141414]',
  'bg-[#FAFAFA]': 'dark:bg-[#0A0A0A]',
  'text-[#111111]': 'dark:text-white',
  'text-black': 'dark:text-white',
  'border-black': 'dark:border-white/20',
};

function processToken(token) {
  // If it already has dark:, selection:, or hover:, handle it carefully 
  if (token.includes('dark:')) return token;
  if (token.includes('selection:')) return token;

  // Direct map
  if (directMap[token]) {
    return `${token} ${directMap[token]}`;
  }

  // Handle specific dynamic opacities text-black/60, bg-[#FAFAFA]/80
  let match;

  // bg-[#FAFAFA]/opacity
  if ((match = token.match(/^bg-\[\#FAFAFA\]\/(.+)$/))) {
    return `${token} dark:bg-[#0A0A0A]/${match[1]}`;
  }

  // text-black/opacity
  if ((match = token.match(/^text-black\/(.+)$/))) {
    return `${token} dark:text-white/${match[1]}`;
  }

  // border-black/[opacity] -> border-white/[opacity*2 or 0.1]
  if ((match = token.match(/^border-black\/(.+)$/))) {
    // Increase border opacity slightly for dark mode contrast
    return `${token} dark:border-white/${match[1]}`;
  }

  // hover:bg-black/[opacity]
  if ((match = token.match(/^hover:bg-black\/(.+)$/))) {
    return `${token} dark:hover:bg-white/${match[1]}`;
  }

  // bg-black/[opacity] (e.g. bg-black/[0.03])
  // Skip if it's the solid black button "bg-black" -> "dark:bg-white" and text will invert.
  if ((match = token.match(/^bg-black\/(.+)$/))) {
    return `${token} dark:bg-white/${match[1]}`;
  }

  if (token === 'bg-black') {
    return `bg-black dark:bg-white text-white dark:text-black`;
  }

  return token;
}

function processLine(line) {
  // We'll just replace 'words' using a replacer that evaluates each token.
  // A 'word' in tailwind classes is typically letters, numbers, -, [, ], /, #, %
  // This regex matches standard tailwind classes
  return line.replace(/([a-zA-Z0-9\-\[\]\#\/\%:]+)/g, (match) => {
    // avoid touching imports, urls or things that aren't tailwind classes
    if (match.includes('://')) return match;
    if (match.startsWith('/')) return match;
    if (match.endsWith('.tsx')) return match;
    
    // We only process valid tokens
    return processToken(match);
  });
}

function processFile(filePath) {
  // Instead of processing every line blindly, we only target lines containing className
  // To be perfectly safe, we can read lines, and if line has className, we process the tokens within the quotes.
  const content = fs.readFileSync(filePath, 'utf8');
  let result = '';

  // Improved tokenization: find className="..." or className={...} boundaries
  // Because className can span multiple lines (especially with clsx or template literals),
  // a global replacer that only alters recognized tailwind tokens is safer.
  
  result = content.replace(/([a-zA-Z0-9\-\[\]\#\/\%:]+)/g, (match, offset, fullText) => {
    // Exclude if it looks like a URL, path, or part of a JS statement
    if (match.includes('://')) return match;
    if (match.startsWith('/')) return match;
    if (match.endsWith('.tsx') || match.endsWith('.png') || match.endsWith('.js')) return match;
    if (match.includes('import') || match.includes('export') || match.includes('const')) return match;
    
    // Check if the match is exactly one of our known tailwind patterns
    const isTailwindPattern = 
      match.startsWith('bg-white') ||
      match.startsWith('bg-[#FAFAFA]') ||
      match.startsWith('text-[#111111]') ||
      match.startsWith('text-black') ||
      match.startsWith('border-black') ||
      match.startsWith('hover:bg-black') ||
      match.startsWith('bg-black');

    if (isTailwindPattern) {
      // Don't process if preceded by dark: (which is already skipped by processToken)
      return processToken(match);
    }
    return match;
  });

  // Clean up any double injected classes (like if bg-black text-white both added dark variants)
  result = result.replace(/text-white dark:text-black dark:text-white/g, 'text-white dark:text-black');
  
  if (result !== content) {
    fs.writeFileSync(filePath, result);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'ThemeContext.tsx') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx')) {
      processFile(filePath);
    }
  }
}

walkDir(path.join(__dirname, '../src'));
