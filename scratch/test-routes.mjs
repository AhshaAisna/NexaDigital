import { execSync } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const urls = [
  'http://localhost:5173/',
  'http://localhost:5173/#about',
  'http://localhost:5173/#services',
  'http://localhost:5173/#backend',
  'http://localhost:5173/#client'
];

for (const url of urls) {
  try {
    const html = execSync(`"${chromePath}" --headless=new --disable-gpu --dump-dom "${url}"`, { maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' });
    const hasAppContent = html.includes('Nexa Digital') && html.length > 5000;
    console.log(`URL: ${url} => length: ${html.length} bytes, hasAppContent: ${hasAppContent}`);
  } catch (err) {
    console.error(`URL: ${url} failed:`, err.message);
  }
}
