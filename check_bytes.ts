import fs from 'fs';
import path from 'path';

function findPngs(dir: string) {
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('.next') || dir.includes('dist')) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findPngs(fullPath);
    } else if (file.endsWith('.png')) {
      console.log('PNG found:', fullPath, 'Size:', stat.size);
    }
  }
}

findPngs(process.cwd());
