'use strict';

var globify      = require('../'),
    expect       = require('chai').expect,
    sinon        = require('sinon'),
    childProcess = require('child_process');

describe('Pass-Through (no glob pattern)', function() {
  beforeEach(function() {
    sinon.stub(console, 'log');
    sinon.stub(childProcess, 'fork');
  });

  afterEach(function() {
    console.log.restore();
    childProcess.fork.restore();
  });

  /**
   * Asserts that the given command was called only once, and with the given arguments.
   */
  function assert(cmd, args) {
    sinon.assert.calledOnce(console.log);
    expect(console.log.firstCall.args).to.have.lengthOf(2);
    expect(console.log.firstCall.args[0]).to.equal(cmd);
    expect(console.log.firstCall.args[1]).to.equal(args.join(' '));

    sinon.assert.calledOnce(childProcess.fork);
    expect(childProcess.fork.firstCall.args).to.have.lengthOf(2);
    expect(childProcess.fork.firstCall.args[0]).to.equal(require.resolve(cmd + '/bin/cmd'));
    expect(childProcess.fork.firstCall.args[1]).to.deep.equal(args);
  }

  it('should call browserify without any args', function() {
    globify();
    assert('browserify', []);
  });

  it('should call browserify without any args (empty array)', function() {
    globify([]);
    assert('browserify', []);
  });

  it('should call watchify without any args', function() {
    globify(['--watch']);
    assert('watchify', []);
  });

  it('should call browserify --outfile=FILE', function() {
    globify(['--outfile=dist/my-file.js']);
    assert('browserify', ['--outfile=dist/my-file.js']);
  });

  it('should call browserify --outfile FILE', function() {
    globify(['--outfile', 'dist/my-file.js']);
    assert('browserify', ['--outfile', 'dist/my-file.js']);
  });

  it('should call browserify -o FILE', function() {
    globify(['-o', 'dist/my-file.js']);
    assert('browserify', ['-o', 'dist/my-file.js']);
  });

  it('should call browserify --outfile=FILESPEC', function() {
    globify(['--outfile=dist/**/*.js']);
    assert('browserify', ['--outfile=dist/**/*.js']);
  });

  it('should call browserify --outfile FILESPEC', function() {
    globify(['--outfile', 'dist/**/*.js']);
    assert('browserify', ['--outfile', 'dist/**/*.js']);
  });

  it('should call browserify -o FILESPEC', function() {
    globify(['-o', 'dist/**/*.js']);
    assert('browserify', ['-o', 'dist/**/*.js']);
  });

  it('should call browserify --outfile=DIR', function() {
    globify(['--outfile=dist']);
    assert('browserify', ['--outfile=dist']);
  });

  it('should call browserify --outfile DIR', function() {
    globify(['--outfile', 'dist']);
    assert('browserify', ['--outfile', 'dist']);
  });

  it('should call browserify -o DIR', function() {
    globify(['-o', 'dist']);
    assert('browserify', ['-o', 'dist']);
  });

  it('should call browserify INFILE --outfile=FILE', function() {
    globify(['lib/index.js', '--outfile=dist/my-file.js']);
    assert('browserify', ['lib/index.js', '--outfile=dist/my-file.js']);
  });

  it('should call browserify INFILE --outfile=FILESPEC', function() {
    globify(['lib/index.js', '--outfile=dist/*.js']);
    assert('browserify', ['lib/index.js', '--outfile=dist/*.js']);
  });

  it('should call browserify INFILE --outfile=DIR', function() {
    globify(['lib/index.js', '--outfile=dist']);
    assert('browserify', ['lib/index.js', '--outfile=dist']);
  });

  it('should call watchify INFILE --outfile=DIR', function() {
    globify(['lib/index.js', '-w', '--outfile=dist']);
    assert('watchify', ['lib/index.js', '--outfile=dist']);
  });
});
