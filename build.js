#!/usr/bin/env node
/**
 * 简单构建脚本 - 将 src/ 下的 TS 和 JS 文件复制到 dist/
 * 注意：这只是复制，不做类型检查。类型检查在 IDE 中完成。
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = './js';
const DIST_DIR = './dist';

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function copyFile(src, dest) {
	ensureDir(path.dirname(dest));
	fs.copyFileSync(src, dest);
	console.log(`Copied: ${src} -> ${dest}`);
}

function processFile(srcPath) {
	const relativePath = path.relative(SRC_DIR, srcPath);
	const ext = path.extname(srcPath);
	
	// TS 文件：复制到 dist 并改扩展名为 .js
	if (ext === '.ts') {
		const destPath = path.join(DIST_DIR, relativePath.replace('.ts', '.js'));
		// 简单处理：直接复制内容，不做转换
		// 因为浏览器不支持 TS，我们需要手动维护 JS 版本
		// 或者使用 esbuild/shift 等工具
		console.log(`Warning: ${srcPath} is TypeScript, please convert to JavaScript manually or use tsc`);
		return;
	}
	
	// JS 文件：直接复制
	if (ext === '.js') {
		const destPath = path.join(DIST_DIR, relativePath);
		copyFile(srcPath, destPath);
		return;
	}
}

function walkDir(dir, callback) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
			walkDir(fullPath, callback);
		} else {
			callback(fullPath);
		}
	}
}

// 主流程
console.log('Building...');
ensureDir(DIST_DIR);
walkDir(SRC_DIR, processFile);
console.log('Done!');
