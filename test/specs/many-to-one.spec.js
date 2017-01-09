'use strict';

const helper = require('../fixtures/helper');
const globify = require('../../');

describe('many-to-one', () => {
  it('should call browserify with files matching glob pattern', () => {
    globify(['lib/**/*.js']);
    helper.assert('browserify', ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js']);
  });

  it('should call watchify with files matching glob pattern', () => {
    globify(['lib/**/*.js', '-w']);
    helper.assert('watchify', ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js']);
  });

  it('should call browserify GLOB --outfile=FILE', () => {
    globify(['lib/**/*.js', '--outfile=dist/my-file.js']);
    helper.assert(
      'browserify',
      ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js', '--outfile=dist/my-file.js']
    );
  });

  it('should call watchify GLOB -o FILE', () => {
    globify(['lib/**/*.js', '-o', 'dist/my-file.js', '-w']);
    helper.assert('watchify', ['lib/hello-world.js', 'lib/index.js', 'lib/say/index.js', '-o', 'dist/my-file.js']);
  });

  it('should call browserify GLOB -u GLOB', () => {
    globify(['lib/**/*.js', '-u', '**/hello-*.js']);
    helper.assert('browserify', ['lib/index.js', 'lib/say/index.js', '-u', '**/hello-*.js']);
  });

  it('should call browserify GLOB --exclude=GLOB', () => {
    globify(['lib/**/*.js', '--exclude=**/hello-*.js', '-w']);
    helper.assert('watchify', ['lib/index.js', 'lib/say/index.js', '--exclude=**/hello-*.js']);
  });

  it('should call browserify with lots of options', () => {
    globify([
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/**/*.js', '-g', 'browserify-istanbul', '-u=**/hello-*.js',
      '--outfile', 'dist/my-file.js'
    ]);

    helper.assert('browserify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/index.js', 'lib/say/index.js', '-g', 'browserify-istanbul',
      '-u=**/hello-*.js', '--outfile', 'dist/my-file.js'
    ]);
  });

  it('should call watchify with lots of options', () => {
    globify([
      '-g', 'uglifyify', '-w',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/**/*.js', '-g', 'browserify-istanbul', '--exclude', '**/hello-*.js',
      '--outfile', 'dist/my-file.js'
    ]);

    helper.assert('watchify', [
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/index.js', 'lib/say/index.js', '-g', 'browserify-istanbul',
      '--exclude', '**/hello-*.js', '--outfile', 'dist/my-file.js'
    ]);
  });
});
