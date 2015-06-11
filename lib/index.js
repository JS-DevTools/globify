'use strict';

var glob         = require('glob'),
    path         = require('path'),
    childProcess = require('child_process');

module.exports = globify;

/**
 * Runs browserify or watchify with the given arguments for each file that matches the glob pattern.
 *
 * @param {string[]} args - the command-line arguments
 */
function globify(args) {
  args = parseArgs(args);
  var expand = args[args.expandIndex];
  var rename = args[args.renameIndex];
  var files = expand && expand();

  if (!expand) {
    // No glob patterns were found, so just run browserify as-is
    if (rename) {
      args[args.renameIndex] = rename();
    }
    browserify(args);
  }
  else if (!renameIndex) {
    // Run browserify with the expanded list of file names
    Array.prototype.splice.apply(args, [args.expandIndex, 1].concat(files));
    browserify(args);
  }
  else {
    // Run browserify separately for each file
    files.forEach(function(file) {
      var fileArgs = args.slice();
      fileArgs[args.expandIndex] = file;
      fileArgs[args.renameIndex] = rename(file, args.baseDir);
      browserify(fileArgs);
    });
  }
}

/**
 * Parses the command-line arguments and replaces glob patterns with functions to expand those patterns.
 *
 * @param {string[]} args
 * @returns {Array}
 */
function parseArgs(args) {
  var parsedArgs = [];
  parsedArgs.cmd = 'browserify';
  parsedArgs.baseDir = '';
  parsedArgs.expandIndex = -1;
  parsedArgs.renameIndex = -1;

  args = args || [];
  for (var i = 0; i < args.length; i++) {
    var arg = args[i];

    if (arg === '-o' || arg === '--outfile') {
      // Push this arg as-is
      parsedArgs.push(arg);

      // The next arg is the output file
      arg = args[++i];
      if (isDirectory(arg)) {
        // The output filename will be different for each bundle
        parsedArgs.renameIndex = parsedArgs.length;
        parsedArgs.push(renameIndex.bind(null, '', arg));
      }
      else {
        // Use the output filename as-is
        parsedArgs.push(arg);
      }
    }
    else if (arg.substr(0, 10) === '--outfile=') {
      arg = arg.substr(10);
      if (isDirectory(arg)) {
        // The output filename will be different for each bundle
        parsedArgs.renameIndex = parsedArgs.length;
        parsedArgs.push(renameIndex.bind(null, '--outfile=', arg));
      }
      else {
        // Use the output filename as-is
        parsedArgs.push('--outfile=' + arg);
      }
    }
    else if (arg === '-w' || arg === '--watch') {
      // This is a globify arg.  Don't pass it along
      parsedArgs.cmd = 'watchify';
    }
    else if (arg === '[') {
      // This is the start of a sub-argument list.  So just pass along the list as-is
      while (arg !== ']') {
        parsedArgs.push(arg);
        arg = args[++i];
      }
      parsedArgs.push(arg);
    }
    else if (arg.substr(1) === '-') {
      // Just pass this arg along as-is
      parsedArgs.push(arg);
    }
    else if (parsedArgs.expandIndex === -1 && glob.hasMagic(arg)) {
      // We found the entry file glob pattern
      parsedArgs.baseDir = getBaseDir(arg);
      parsedArgs.expandIndex = parsedArgs.length;
      parsedArgs.push(glob.sync.bind(glob, arg));
    }
    else {
      // Just pass this arg along as-is
      parsedArgs.push(arg);
    }
  }

  return parsedArgs;
}

/**
 * Determines the base directory of the given glob pattern.
 * This is used to determine the relative paths of matched files.
 *
 * @param {string} pattern
 * @returns {string}
 */
function getBaseDir(pattern) {
  // Some examples:
  //  - *.js                          =>  .
  //  - dir/**/*.js                   =>  dir
  //  - dir/subdir/main-*.js          =>  dir/subdir
  //  - dir/subdir/index.js           =>  dir/subdir
  //  - dir/subdir/index.(js|coffee)  =>  dir/subdir

  var wildcard = pattern.indexOf('*');
  if (wildcard >= 0) {
    pattern = pattern.substr(0, wildcard + 1);
  }
  return path.dirname(pattern);
}

/**
 * Determines whether the given output filename is a directory.
 *
 * @param {string} pattern
 */
function isDirectory(pattern) {
  var basename = path.basename(pattern);
  if (basename.indexOf('*') >= 0) {
    // The pattern includes a filename pattern (e.g. "dist/*.min.js"),
    // which counts as a directory path
    return true;
  }
  else if (basename.indexOf('.') === -1) {
    // The pattern has no file extension, so assume it's a directory
    return true;
  }

  return false;
}

/**
 * Renames the given file according to the given pattern.
 *
 * @param {string} prefix - Either an empty string or "--outfile="
 * @param {string} pattern - The output file path and pattern (e.g. "dest/*.min.js")
 * @param {string} file - The source file path and name (e.g. "lib/subdir/my-file.js")
 * @param {string} baseDir - The directory to calculate the relative path from (e.g. "lib")
 * @returns {string} - The output file path and name (e.g. "dest/subdir/my-file.min.js")
 */
function renameIndex(prefix, pattern, file, baseDir) {
  if (!file) {
    // No filename, so return the original pattern
    return prefix + pattern;
  }

  var fileExtName = path.extname(file);                                             // .js
  var fileBaseName = path.basename(file, fileExtName);                              // my-file
  var relativeDir = path.dirname(path.relative(baseDir, file));                     // subdir

  var patternFileName = path.basename(pattern);                                     // *.min.js
  var patternDir;
  if (patternFileName.indexOf('*') === -1) {
    patternDir = pattern;                                                           // dest
  }
  else {
    patternDir = path.dirname(pattern);                                             // dest
    fileExtName = patternFileName.substr(patternFileName.indexOf('*') + 1);         // .min.js
  }

  var outputPath = path.join(patternDir, relativeDir, fileBaseName + fileExtName);  // dest/subdir/my-file.min.js
  return prefix + outputPath;
}

/**
 * Runs browserify (or watchify) with the given arguments.
 *
 * @param {string[]} args
 */
function browserify(args) {
  console.log(args.cmd, args.join(' '));
  childProcess.fork(require.resolve(args.cmd + '/bin/cmd'), args.slice());
}
