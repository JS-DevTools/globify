'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');
const childProcess = require('child_process');

const originalLogMethod = console.log;

module.exports = { assert };

// Run all the tests from the "sample-package" directory
process.chdir(path.join(__dirname, '../', 'sample-package'));

beforeEach(() => {
  sinon.stub(childProcess, 'fork');
  sinon.stub(console, 'log').callsFake(captureLogs);
});

afterEach(() => {
  console.log.restore();
  childProcess.fork.restore();
});

/**
 * Asserts that the given command was called with the given arguments.
 */
function assert (cmd, calls) {
  calls = Array.prototype.slice.call(arguments, 1);

  // Make sure each stub was called the correct number of times
  sinon.assert.callCount(console.log, calls.length);
  sinon.assert.callCount(childProcess.fork, calls.length);

  calls.forEach((args, index) => {
    let log = console.log.getCall(index);
    expect(log.args).to.have.lengthOf(2);
    expect(log.args[0]).to.equal(cmd);
    expect(log.args[1]).to.equal(args.join(' '));

    let exec = childProcess.fork.getCall(index);
    expect(exec.args).to.have.lengthOf(2);
    expect(exec.args[0]).to.equal(require.resolve(cmd + '/bin/cmd'));
    expect(exec.args[1]).to.deep.equal(args);
  });
}

/**
 * Suppresses certain console logs, to avoid cluttering the test results
 */
function captureLogs () {
  if (arguments[0] === 'browserify' || arguments[0] === 'watchify') {
    // suppress this output, so we don't clutter the test results
  }
  else {
    originalLogMethod.apply(console, arguments);
  }
}
