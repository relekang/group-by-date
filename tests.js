/* eslint-env jest */
jest.mock('mkdirp', () => jest.fn((path, callback) => callback()));
jest.mock('fs', () => ({
  readdir: jest.fn(),
  stat: jest.fn(),
  rename: jest.fn((from, to, callback) => callback()),
}));

const fs = require('fs');
const mkdirp = require('mkdirp');

const { createTask, atLeastTwoDigits, createDirectoryPath } = require('./');

[
  [1, '01'],
  [2, '02'],
  [3, '03'],
  [4, '04'],
  [5, '05'],
  [10, '10'],
  [101, '101'],
].forEach(([i, expected]) => {
  test(`atLeastTwoDigits(${i}) === ${JSON.stringify(expected)}`, () => {
    expect(atLeastTwoDigits(i)).toEqual(expected);
  });
});

[
  [{ months: false, days: false }, '/2018'],
  [{ months: true, days: false }, '/2018/10'],
  [{ months: true, days: true }, '/2018/10/20'],
  [{ months: false, days: true }, '/2018/10/20'],
  [{ months: false, days: false, oneLevel: true }, '/2018'],
  [{ months: true, days: false, oneLevel: true }, '/2018-10'],
  [{ months: true, days: true, oneLevel: true }, '/2018-10-20'],
  [{ months: false, days: true, oneLevel: true }, '/2018-10-20'],
].forEach(([options, expected]) => {
  const o = JSON.stringify(options);
  const e = JSON.stringify(expected);
  test(`createDirectoryPath(${o}, new Date(2018, 9, 20), "/") = ${e}`, () => {
    expect(createDirectoryPath(options, new Date(2018, 9, 20), '/')).toEqual(
      expected
    );
  });
});

test('createTask() should create task that does not move file when dryRun = true', async () => {
  await createTask({ dryRun: true }, '/', {
    name: 'file.png',
    stat: { birthtime: new Date().getTime() },
  })();

  expect(mkdirp).not.toHaveBeenCalled();
  expect(fs.rename).not.toHaveBeenCalled();
});

test('createTask() should create task that does move file when dryRun = false', async () => {
  await createTask({ dryRun: false }, '/', {
    name: 'file.png',
    path: '/file.png',
    stat: { birthtime: new Date().getTime() },
  })();

  expect(mkdirp).toHaveBeenCalled();
  expect(mkdirp.mock.calls[0][0]).toEqual('/2018');
  expect(fs.rename).toHaveBeenCalled();
  expect(fs.rename.mock.calls[0][0]).toEqual('/file.png');
  expect(fs.rename.mock.calls[0][1]).toEqual('/2018/file.png');
});
