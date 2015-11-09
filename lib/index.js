'use strict';

var childProcess = require('child_process'),
    ParsedArgs   = require('./parsed-args');

module.exports = globify;

/**
 * Runs browserify or watchify with the given arguments for each file that matches the glob pattern.
 *
 * @param {string[]} args - the command-line arguments
 */
function globify(args) {
  var parsed = new ParsedArgs(args);
  var expandGlob = parsed.args[parsed.globIndex];
  var renameOutfile = parsed.args[parsed.outfileIndex];
  var files = expandGlob && expandGlob(parsed.globOptions);

  if (!expandGlob) {
    // No glob patterns were found, so just run browserify as-is
    if (renameOutfile) {
      parsed.args[parsed.outfileIndex] = renameOutfile();
    }
    browserify(parsed.cmd, parsed.args);
  }
  else if (!renameOutfile) {
    // Run browserify with the expanded list of file names
    Array.prototype.splice.apply(parsed.args, [parsed.globIndex, 1].concat(files));
    browserify(parsed.cmd, parsed.args);
  }
  else {
    // Run browserify separately for each file
    files.forEach(function(file) {
      var fileArgs = parsed.args.slice();
      fileArgs[parsed.globIndex] = file;
      fileArgs[parsed.outfileIndex] = renameOutfile(file, parsed.baseDir);
      browserify(parsed.cmd, fileArgs);
    });
  }
}

/**
 * Runs browserify (or watchify) with the given arguments.
 *
 * @param {string} cmd - The command to run ("browserify" or "watchify")
 * @param {string[]} args - The command-line arguments to pass
 */
function browserify(cmd, args) {
  console.log(cmd, args.join(' '));
  childProcess.fork(require.resolve(cmd + '/bin/cmd'), args.slice());
}
