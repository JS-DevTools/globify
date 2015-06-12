'use strict';

var helper  = require('./helper'),
    globify = require('../'),
    path =    require('path');

describe('many-to-many', function() {
  it('should call browserify GLOB --outfile=FILESPEC', function() {
    globify(['lib/**/*.js', '--outfile=dist/**/*.bundle.min.js']);
    helper.assert(
      'browserify',
      ['lib/hello-world.js', '--outfile=' + path.normalize('dist/hello-world.bundle.min.js')],
      ['lib/index.js', '--outfile=' + path.normalize('dist/index.bundle.min.js')],
      ['lib/say/index.js', '--outfile=' + path.normalize('dist/say/index.bundle.min.js')]
    );
  });

  it('should call watchify GLOB -o FILESPEC', function() {
    globify(['lib/**/*.js', '-w', '-o', 'dist/*.js']);
    helper.assert(
      'watchify',
      ['lib/hello-world.js', '-o', path.normalize('dist/hello-world.js')],
      ['lib/index.js', '-o', path.normalize('dist/index.js')],
      ['lib/say/index.js', '-o', path.normalize('dist/say/index.js')]
    );
  });

  it('should call browserify GLOB --outfile=DIR', function() {
    globify(['lib/**/*.js', '--outfile=dist']);
    helper.assert(
      'browserify',
      ['lib/hello-world.js', '--outfile=' + path.normalize('dist/hello-world.js')],
      ['lib/index.js', '--outfile=' + path.normalize('dist/index.js')],
      ['lib/say/index.js', '--outfile=' + path.normalize('dist/say/index.js')]
    );
  });

  it('should call watchify GLOB -o DIR', function() {
    globify(['lib/**/*.js', '-o', 'dist', '--watch']);
    helper.assert(
      'watchify',
      ['lib/hello-world.js', '-o', path.normalize('dist/hello-world.js')],
      ['lib/index.js', '-o', path.normalize('dist/index.js')],
      ['lib/say/index.js', '-o', path.normalize('dist/say/index.js')]
    );
  });

  it('should call browserify GLOB -u GLOB -o DIR', function() {
    globify(['lib/**/*.js', '-u', '**/hello-*.js', '-o', 'dist']);
    helper.assert(
      'browserify',
      ['lib/index.js', '-u', '**/hello-*.js', '-o', 'dist/index.js'],
      ['lib/say/index.js', '-u', '**/hello-*.js', '-o', 'dist/say/index.js']
    );
  });

  it('should call browserify GLOB --exclude=GLOB --outfile=DIR', function() {
    globify(['lib/**/*.js', '--exclude=**/hello-*.js', '-w', '--outfile=dist']);
    helper.assert(
      'watchify',
      ['lib/index.js', '--exclude=**/hello-*.js', '--outfile=dist/index.js'],
      ['lib/say/index.js', '--exclude=**/hello-*.js', '--outfile=dist/say/index.js']
    );
  });

  it('should call browserify with lots of options', function() {
    globify([
      '-g', 'uglifyify',
      '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
      'lib/**/*.js', '-g', 'browserify-istanbul', '--outfile', '*.coffee', '-u=**/hello-*.js'
    ]);

    helper.assert(
      'browserify',
      [
        '-g', 'uglifyify',
        '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
        'lib/index.js', '-g', 'browserify-istanbul', '--outfile', 'index.coffee', '-u=**/hello-*.js'
      ],
      [
        '-g', 'uglifyify',
        '-t', '[', 'foo-bar', '--biz', '-baz', '--watch', 'hello, world', '*.html', ']',
        'lib/say/index.js', '-g', 'browserify-istanbul',
        '--outfile', path.normalize('say/index.coffee'), '-u=**/hello-*.js'
      ]
    );
  });

  it('should call watchify with lots of options', function() {
    globify([
      '-g', 'uglifyify', '-w',
      '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
      'lib/**/*.js', '-g', 'browserify-istanbul', '--outfile', 'dist/release/*.coffee',
      '--exclude', '**/hello-*.js'
    ]);

    helper.assert(
      'watchify',
      [
        '-g', 'uglifyify',
        '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
        'lib/index.js', '-g', 'browserify-istanbul',
        '--outfile', path.normalize('dist/release/index.coffee'),
      '--exclude', '**/hello-*.js'
      ],
      [
        '-g', 'uglifyify',
        '-t', '[', 'foo-bar', '--biz', '-baz', 'hello, world', '*.html', ']',
        'lib/say/index.js', '-g', 'browserify-istanbul',
        '--outfile', path.normalize('dist/release/say/index.coffee'),
      '--exclude', '**/hello-*.js'
      ]
    );
  });
});
