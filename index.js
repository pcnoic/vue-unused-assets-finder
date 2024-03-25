#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { parseComponent } = require('vue-template-compiler');

// Help text
const helpText = `
Usage: vue-unused-assets-finder [options]

Options:
  --remove-assets  Remove unused image assets from the filesystem.
  --help           Display this help message and exit.

Description:
  Scans a Vue project's codebase to find and list unused .jpg, .png, and .svg files.
  With the --remove-assets option, it also removes these unused assets.
`;

const displayHelp = () => {
  console.log(helpText);
  process.exit(0);
};

if (process.argv.includes('--help')) {
  displayHelp();
}
const scanDirectory = (srcPath) => {
  const files = glob.sync(`${srcPath}/**/*.{vue,jpg,png,svg}`, { nodir: true });
  return files;
};

const extractAssetReferences = (vueFiles) => {
  const assetReferences = new Set();

  vueFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const parsed = parseComponent(content);
    const templateContent = parsed.template ? parsed.template.content : '';

    const regex = /\b(src|url)\s*=\s*["']([^"']+\.(jpg|png|svg))["']/g;
    let match;
    while ((match = regex.exec(templateContent))) {
      assetReferences.add(match[2]);
    }
  });

  return assetReferences;
};

const findUnusedAssets = (srcPath, removeAssets = false) => {
  const allFiles = scanDirectory(srcPath);
  const vueFiles = allFiles.filter(f => f.endsWith('.vue'));
  const assetFiles = allFiles.filter(f => /\.(jpg|png|svg)$/.test(f));

  const assetReferences = extractAssetReferences(vueFiles);

  const unusedAssets = assetFiles.filter(f => !assetReferences.has(path.basename(f)));

  if (unusedAssets.length > 0) {
    console.log('Unused assets:');
    unusedAssets.forEach(asset => {
      console.log(asset);
      if (removeAssets) {
        fs.removeSync(asset);
        console.log(`Removed: ${asset}`);
      }
    });
  } else {
    console.log('No unused assets found.');
  }
};

const shouldRemoveAssets = process.argv.includes('--remove-assets');

findUnusedAssets('.', shouldRemoveAssets);
