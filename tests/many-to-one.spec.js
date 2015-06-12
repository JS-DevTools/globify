'use strict';

var helper  = require('./helper'),
    globify = require('../');

describe('many-to-one', function() {
  it('should call browserify with files matching glob pattern', function() {
    globify(['lib/**/*.js']);
    helper.assert('browserify', ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js']);
  });

  it('should call watchify with files matching glob pattern', function() {
    globify(['lib/**/*.js', '-w']);
    helper.assert('watchify', ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js']);
  });

  it('should call browserify GLOB --outfile=FILE', function() {
    globify(['lib/**/*.js', '--outfile=dist/my-file.js']);
    helper.assert('browserify', ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js', '--outfile=dist/my-file.js']);
  });

  it('should call watchify GLOB -o FILE', function() {
    globify(['lib/**/*.js', '-o', 'dist/my-file.js', '-w']);
    helper.assert('watchify', ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js', '-o', 'dist/my-file.js']);
  });

  it('should call browserify with lots of options', function() {
    globify([
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/**/*.js', '-g', 'browserify-istanbul', '--outfile', 'dist/my-file.js'
    ]);

    helper.assert('browserify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/hello-world.js', 'lib/index.js', 'lib/say/index.js', '-g', 'browserify-istanbul',
      '--outfile', 'dist/my-file.js'
    ]);
  });

  it('should call watchify with lots of options', function() {
    globify([
      '-g', 'uglifyify', '-w',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/**/*.js', '-g', 'browserify-istanbul', '--outfile', 'dist/my-file.js'
    ]);

    helper.assert('watchify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/hello-world.js', 'lib/index.js', 'lib/say/index.js', '-g', 'browserify-istanbul',
      '--outfile', 'dist/my-file.js'
    ]);
  });
});
