#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const args = require('args');
const path = require('path');
const { promisify } = require('util');
const Listr = require('listr');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const mkdirp = promisify(require('mkdirp'));

process.on('unhandledRejection', error => {
  throw error;
});

args
  .option('months', 'Instead of <year>/<file> <year>/<month>/<file>')
  .option('days', 'Instead of <year>/<file> <year>/<month>/<days>/<file>')
  .option(
    'one-level',
    'Put month/day in folder-name instead of subfolders when used with --months or --days '
  )
  .option('dry-run', 'Print instead of doing');

function createMetadata(currentPath) {
  return async name => {
    const fileEnding = name.split('.').slice(-1)[0];
    return {
      name,
      path: path.join(currentPath, name),
      fileEnding: fileEnding !== name ? fileEnding : undefined,
      stat: await stat(path.join(currentPath, name)),
    };
  };
}

function atLeastTwoDigits(number) {
  const output = String(number);
  return output.length === 1 ? '0' + output : output;
}

function createDirectoryPath(options, created, currentPath) {
  const parts = [
    String(created.getUTCFullYear()),
    ...(options.months || options.days
      ? [atLeastTwoDigits(created.getMonth() + 1)]
      : []),
    ...(options.days ? [atLeastTwoDigits(created.getDate())] : []),
  ];
  return path.join(
    currentPath,
    ...(options.oneLevel ? [parts.join('-')] : parts)
  );
}

function createTask(options, currentPath, file) {
  return async () => {
    const created = new Date(file.stat.birthtime);
    const newDir = createDirectoryPath(options, created, currentPath);
    const newPath = path.join(newDir, file.name);

    if (!options.dryRun) {
      await mkdirp(newDir);
      await rename(file.path, newPath);
    }
  };
}

module.exports = {
  createTask,
  createMetadata,
  atLeastTwoDigits,
  createDirectoryPath,
};

async function main(argv, currentPath) {
  const options = args.parse(argv);
  const files = await Promise.all(
    (await readdir(currentPath)).map(createMetadata(currentPath))
  );

  const tasks = new Listr(
    files.filter(file => file.stat.isFile() && file.fileEnding).map(file => ({
      title: file.name,
      skip: () => options.dryRun,
      concurrent: true,
      task: createTask(options, currentPath, file),
    })),
    { concurrent: 10 }
  );

  await tasks.run();
}

if (require.main === module) {
  main(process.argv, process.cwd());
}
