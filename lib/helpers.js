'use strict';

var path   = require('path'),
    mkdirp = require('mkdirp'),
    touch  = require('touch');

module.exports = {
  getBaseDir: getBaseDir,
  isDirectory: isDirectory,
  rename: rename
};

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
function rename(prefix, pattern, file, baseDir) {
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
    patternDir = getBaseDir(pattern);                                               // dest
    fileExtName = patternFileName.substr(patternFileName.indexOf('*') + 1);         // .min.js
  }

  var outputDir = path.join(patternDir, relativeDir);                               // dest/subdir
  var outputPath = path.join(outputDir, fileBaseName + fileExtName);                // dest/subdir/my-file.min.js

  // Create the output directory and file,
  // since browserify throws errors if they don't exist
  mkdirp(outputDir, function() {
    touch(outputPath);
  });

  return prefix + outputPath;
}
