'use strict';

var expect       = require('chai').expect,
    sinon        = require('sinon'),
    path         = require('path'),
    childProcess = require('child_process');

module.exports = {
  assert: assert
};

// Run all the tests from the "sample-package" directory
process.chdir(path.join(__dirname, '../', 'sample-package'));

beforeEach(function() {
  sinon.stub(console, 'log');
  sinon.stub(childProcess, 'fork');
});

afterEach(function() {
  console.log.restore();
  childProcess.fork.restore();
});

/**
 * Asserts that the given command was called with the given arguments.
 */
function assert(cmd, args) {
  args = Array.prototype.slice.call(arguments, 1);

  // Make sure each stub was called the correct number of times
  sinon.assert.callCount(console.log, args.length);
  sinon.assert.callCount(childProcess.fork, args.length);

  args.forEach(function(args, index) {
    var log = console.log.getCall(index);
    expect(log.args).to.have.lengthOf(2);
    expect(log.args[0]).to.equal(cmd);
    expect(log.args[1]).to.equal(args.join(' '));

    var exec = childProcess.fork.getCall(index);
    expect(exec.args).to.have.lengthOf(2);
    expect(exec.args[0]).to.equal(require.resolve(cmd + '/bin/cmd'));
    expect(exec.args[1]).to.deep.equal(args);
  });
}

