'use strict';

const helper = require('../fixtures/helper');
const globify = require('../../');

describe('one-to-one (pass-through)', () => {
  it('should call browserify without any args', () => {
    globify();
    helper.assert('browserify', []);
  });

  it('should call browserify without any args (empty array)', () => {
    globify([]);
    helper.assert('browserify', []);
  });

  it('should call watchify without any args', () => {
    globify(['--watch']);
    helper.assert('watchify', []);
  });

  it('should call browserify --outfile=FILE', () => {
    globify(['--outfile=dist/my-file.js']);
    helper.assert('browserify', ['--outfile=dist/my-file.js']);
  });

  it('should call browserify --outfile FILE', () => {
    globify(['--outfile', 'dist/my-file.js']);
    helper.assert('browserify', ['--outfile', 'dist/my-file.js']);
  });

  it('should call browserify -o FILE', () => {
    globify(['-o', 'dist/my-file.js']);
    helper.assert('browserify', ['-o', 'dist/my-file.js']);
  });

  it('should call watchify -o FILE', () => {
    globify(['-o', 'dist/my-file.js', '-w']);
    helper.assert('watchify', ['-o', 'dist/my-file.js']);
  });

  it('should call browserify --outfile=FILESPEC', () => {
    globify(['--outfile=dist/**/*.js']);
    helper.assert('browserify', ['--outfile=dist/**/*.js']);
  });

  it('should call browserify --outfile FILESPEC', () => {
    globify(['--outfile', 'dist/**/*.js']);
    helper.assert('browserify', ['--outfile', 'dist/**/*.js']);
  });

  it('should call browserify -o FILESPEC', () => {
    globify(['-o', 'dist/**/*.js']);
    helper.assert('browserify', ['-o', 'dist/**/*.js']);
  });

  it('should call watchify -o FILESPEC', () => {
    globify(['-w', '-o', 'dist/**/*.js']);
    helper.assert('watchify', ['-o', 'dist/**/*.js']);
  });

  it('should call browserify --outfile=DIR', () => {
    globify(['--outfile=dist']);
    helper.assert('browserify', ['--outfile=dist']);
  });

  it('should call browserify --outfile DIR', () => {
    globify(['--outfile', 'dist']);
    helper.assert('browserify', ['--outfile', 'dist']);
  });

  it('should call browserify -o DIR', () => {
    globify(['-o', 'dist']);
    helper.assert('browserify', ['-o', 'dist']);
  });

  it('should call watchify -o DIR', () => {
    globify(['-o', 'dist', '--watch']);
    helper.assert('watchify', ['-o', 'dist']);
  });

  it('should call browserify INFILE --outfile=FILE', () => {
    globify(['lib/index.js', '--outfile=dist/my-file.js']);
    helper.assert('browserify', ['lib/index.js', '--outfile=dist/my-file.js']);
  });

  it('should call browserify INFILE --outfile=FILESPEC', () => {
    globify(['lib/index.js', '--outfile=dist/*.js']);
    helper.assert('browserify', ['lib/index.js', '--outfile=dist/*.js']);
  });

  it('should call browserify INFILE --outfile=DIR', () => {
    globify(['lib/index.js', '--outfile=dist']);
    helper.assert('browserify', ['lib/index.js', '--outfile=dist']);
  });

  it('should call watchify INFILE --outfile=DIR', () => {
    globify(['lib/index.js', '-w', '--outfile=dist']);
    helper.assert('watchify', ['lib/index.js', '--outfile=dist']);
  });

  it('should call browserify with lots of options', () => {
    globify([
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '-u', '**/hello-*.js',
      '--outfile', 'dist/'
    ]);

    helper.assert('browserify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '-u', '**/hello-*.js',
      '--outfile', 'dist/'
    ]);
  });

  it('should call watchify with lots of options', () => {
    globify([
      '-g', 'uglifyify', '-w',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '--exclude=**/hello-*.js',
      '--outfile', 'dist/'
    ]);

    helper.assert('watchify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '--exclude=**/hello-*.js',
      '--outfile', 'dist/'
    ]);
  });
});
