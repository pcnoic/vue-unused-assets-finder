#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { parseComponent } = require('vue-template-compiler');

const helpText = `
Usage: vue-unused-assets-finder [options]

Options:
  --remove-assets  Remove unused image assets from the filesystem.
  --help           Display this help message and exit.

Description:
  Scans a Vue project's codebase to find and list unused .jpg, .png, and .svg files, excluding the node_modules folder.
  With the --remove-assets option, it also removes these unused assets.
`;

if (process.argv.includes('--help')) {
    console.log(helpText);
    process.exit(0);
}

const scanDirectory = (srcPath) => {
    console.log(`Scanning directory: ${srcPath}`);
    const files = glob.sync(`${srcPath}/**/*.{vue,scss,css,html,jpg,png,svg}`, {
        nodir: true,
        ignore: '**/node_modules/**',
    });
    console.log(`Found ${files.length} files.`);
    return files;
};

const extractAssetReferences = (files) => {
    console.log(`Extracting asset references from ${files.length} files.`);
    const assetReferences = new Set();

    files.forEach((file, index) => {
        console.log(`Processing file ${index + 1}/${files.length}: ${file}`);
        const content = fs.readFileSync(file, 'utf-8');
        let regex;

        if (file.endsWith('.vue') || file.endsWith('.scss') || file.endsWith('.css') || file.endsWith('.html')) {
            const parsed = file.endsWith('.vue') ? parseComponent(content) : { template: { content } };
            const contentToSearch = parsed.template ? parsed.template.content : content;
            regex = /\b(src|url|v-bind:src|:src)\s*=\s*["']([^"']+\.(jpg|png|svg))["']|require\(["']([^"']+\.(jpg|png|svg))["']\)|url\(["']?([^"')]+)["']?\)/g;
            extractMatches(contentToSearch, regex, file, assetReferences);
        }
    });

    console.log(`Extracted references to ${assetReferences.size} unique assets.`);
    return assetReferences;
};

const extractMatches = (content, regex, currentFile, assetReferences) => {
    let match;
    while ((match = regex.exec(content))) {
        const matchedPath = match[2] || match[4] || match[6];
        if (matchedPath) {
            const normalizedPath = matchedPath.split(/[#?]/)[0];
            const resolvedPath = path.relative('.', path.resolve(path.dirname(currentFile), normalizedPath));
            assetReferences.add(resolvedPath);
        }
    }
};

const excludeFiles = ['favicon.png'];

const findUnusedAssets = (srcPath, removeAssets = false) => {
    console.log(`Finding unused assets in ${srcPath}`);
    const allFiles = scanDirectory(srcPath);
    const assetFiles = allFiles.filter(f => /\.(jpg|png|svg)$/.test(f)).map(file => path.relative('.', file));

    const assetReferences = extractAssetReferences([...allFiles]);

    const unusedAssets = assetFiles.filter(file => {
        return !assetReferences.has(file) && !excludeFiles.includes(path.basename(file));
    });

    if (unusedAssets.length > 0) {
        console.log(`Found ${unusedAssets.length} unused assets.`);
        console.log('Unused assets:');
        unusedAssets.forEach(asset => {
            console.log(path.join(srcPath, asset));
            if (removeAssets && !excludeFiles.includes(path.basename(asset))) {
                fs.removeSync(path.join(srcPath, asset));
                console.log(`Removed: ${path.join(srcPath, asset)}`);
            }
        });
    } else {
        console.log('No unused assets found.');
    }
};

const shouldRemoveAssets = process.argv.includes('--remove-assets');

findUnusedAssets('.', shouldRemoveAssets);
