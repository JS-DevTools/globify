'use strict';

var helper  = require('./helper'),
    globify = require('../');

describe('one-to-one (pass-through)', function() {
  it('should call browserify without any args', function() {
    globify();
    helper.assert('browserify', []);
  });

  it('should call browserify without any args (empty array)', function() {
    globify([]);
    helper.assert('browserify', []);
  });

  it('should call watchify without any args', function() {
    globify(['--watch']);
    helper.assert('watchify', []);
  });

  it('should call browserify --outfile=FILE', function() {
    globify(['--outfile=dist/my-file.js']);
    helper.assert('browserify', ['--outfile=dist/my-file.js']);
  });

  it('should call browserify --outfile FILE', function() {
    globify(['--outfile', 'dist/my-file.js']);
    helper.assert('browserify', ['--outfile', 'dist/my-file.js']);
  });

  it('should call browserify -o FILE', function() {
    globify(['-o', 'dist/my-file.js']);
    helper.assert('browserify', ['-o', 'dist/my-file.js']);
  });

  it('should call watchify -o FILE', function() {
    globify(['-o', 'dist/my-file.js', '-w']);
    helper.assert('watchify', ['-o', 'dist/my-file.js']);
  });

  it('should call browserify --outfile=FILESPEC', function() {
    globify(['--outfile=dist/**/*.js']);
    helper.assert('browserify', ['--outfile=dist/**/*.js']);
  });

  it('should call browserify --outfile FILESPEC', function() {
    globify(['--outfile', 'dist/**/*.js']);
    helper.assert('browserify', ['--outfile', 'dist/**/*.js']);
  });

  it('should call browserify -o FILESPEC', function() {
    globify(['-o', 'dist/**/*.js']);
    helper.assert('browserify', ['-o', 'dist/**/*.js']);
  });

  it('should call watchify -o FILESPEC', function() {
    globify(['-w', '-o', 'dist/**/*.js']);
    helper.assert('watchify', ['-o', 'dist/**/*.js']);
  });

  it('should call browserify --outfile=DIR', function() {
    globify(['--outfile=dist']);
    helper.assert('browserify', ['--outfile=dist']);
  });

  it('should call browserify --outfile DIR', function() {
    globify(['--outfile', 'dist']);
    helper.assert('browserify', ['--outfile', 'dist']);
  });

  it('should call browserify -o DIR', function() {
    globify(['-o', 'dist']);
    helper.assert('browserify', ['-o', 'dist']);
  });

  it('should call watchify -o DIR', function() {
    globify(['-o', 'dist', '--watch']);
    helper.assert('watchify', ['-o', 'dist']);
  });

  it('should call browserify INFILE --outfile=FILE', function() {
    globify(['lib/index.js', '--outfile=dist/my-file.js']);
    helper.assert('browserify', ['lib/index.js', '--outfile=dist/my-file.js']);
  });

  it('should call browserify INFILE --outfile=FILESPEC', function() {
    globify(['lib/index.js', '--outfile=dist/*.js']);
    helper.assert('browserify', ['lib/index.js', '--outfile=dist/*.js']);
  });

  it('should call browserify INFILE --outfile=DIR', function() {
    globify(['lib/index.js', '--outfile=dist']);
    helper.assert('browserify', ['lib/index.js', '--outfile=dist']);
  });

  it('should call watchify INFILE --outfile=DIR', function() {
    globify(['lib/index.js', '-w', '--outfile=dist']);
    helper.assert('watchify', ['lib/index.js', '--outfile=dist']);
  });

  it('should call browserify with lots of options', function() {
    globify([
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '--outfile', 'dist/'
    ]);

    helper.assert('browserify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '--outfile', 'dist/'
    ]);
  });

  it('should call watchify with lots of options', function() {
    globify([
      '-g', 'uglifyify', '-w',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '--outfile', 'dist/'
    ]);

    helper.assert('watchify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/index.js', '-g', 'browserify-istanbul', '--outfile', 'dist/'
    ]);
  });
});
