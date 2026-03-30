import { access, cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const defaultDeployDir = '/home/dbulkin/projects/dave-bulkin-net/public/games/blocks4gina';
const deployDir = process.env.B4G_DEPLOY_DIR ?? defaultDeployDir;
const runtimeAssets = [
  'sound.wav',
  'scott-buckley-permafrost(chosic.com).mp3'
];

async function ensurePathExists (targetPath) {
  await access(targetPath);
}

async function clearDirectoryContents (dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(dirPath, entry.name);
    await rm(entryPath, { recursive: true, force: true });
  }));
}

async function copyRuntimeAssets (targetDir) {
  await Promise.all(runtimeAssets.map(async (assetName) => {
    const source = path.join(projectRoot, assetName);
    await ensurePathExists(source);
    await cp(source, path.join(targetDir, assetName));
  }));
}

async function main () {
  await ensurePathExists(distDir);
  await mkdir(deployDir, { recursive: true });
  await clearDirectoryContents(deployDir);
  await cp(distDir, deployDir, { recursive: true });
  await copyRuntimeAssets(deployDir);

  process.stdout.write(`Deployed Blocks4Gina to ${deployDir}\n`);
}

main().catch((error) => {
  process.stderr.write(`Deploy failed: ${String(error)}\n`);
  process.exitCode = 1;
});
