/* eslint complexity:1 */
'use strict';

const glob = require('glob');
const globby = require('globby');
const helpers = require('./helpers');

module.exports = ParsedArgs;

/**
 * Parses the command-line arguments and replaces glob patterns with functions to expand those patterns.
 *
 * @param {string[]} args - All command-line arguments, most of which will simply be passed to Browserify
 * @constructor
 */
function ParsedArgs (args) {
  /**
   * The command to run ("browserify" or "watchify")
   * @type {string}
   */
  this.cmd = 'browserify';

  /**
   * The base directory for the entry-file glob pattern.
   * See {@link helpers#getBaseDir} for details.
   * @type {string}
   */
  this.baseDir = '';

  /**
   * Options for how the entry-file glob pattern should be parsed.
   * For example if an --exclude argument is specified, then `globOptions.ignore` will be set accordingly.
   * @type {object}
   */
  this.globOptions = { ignore: []};

  /**
   * The index of the entry-file glob argument.
   * If there is no entry-file argument, or it's not a glob pattern, then this will be -1.
   * @type {number}
   */
  this.globIndex = -1;

  /**
   * The index of the outfile argument.
   * If there is no outfile argument, or it's not a glob pattern, then this will be -1;
   * @type {number}
   */
  this.outfileIndex = -1;

  /**
   * The arguments to pass to browserify.
   * If {@link globIndex} or {@link outfileIndex} are set, then the corresponding elements in
   * this array will be the corresponding functions.
   * @type {Array}
   */
  this.args = [];

  args = args || [];
  while (args.length > 0) {
    parseOutfile(args, this) ||
    parseExclude(args, this) ||
    parseWatch(args, this) ||
    parseSubArgs(args, this) ||
    parseDashArgs(args, this) ||
    parseGlobs(args, this) ||
    passThrough(args, this);
  }
}

/**
 * If the current argument is the --outfile argument,
 * then this function parses it and shifts it to {@link ParsedArgs#args}.
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @returns {boolean}
 */
function parseOutfile (args, parsed) {
  let arg = parseNameValueArg(args, parsed, '-o', '--outfile');

  if (arg) {
    if (helpers.isDirectory(arg.value)) {
      // The output filename will be different for each bundle
      parsed.outfileIndex = parsed.args.length;
      parsed.args.push(helpers.rename.bind(null, arg.prefix, arg.value));
    }
    else {
      // Pass the argument as-is
      parsed.args.push(arg.prefix + arg.value);
    }

    return true;
  }
}

/**
 * If the current argument is the --exclude argument,
 * then this function sets {@link ParsedArgs.globOptions.ignore}
 * and shifts it to {@link ParsedArgs#args}.
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @returns {boolean}
 */
function parseExclude (args, parsed) {
  let arg = parseNameValueArg(args, parsed, '-u', '--exclude');

  if (arg) {
    parsed.globOptions.ignore.push(arg.value);
    parsed.args.push(arg.prefix + arg.value);
    return true;
  }
}

/**
 * If the current argument is the --watch argument,
 * then this function sets {@link ParsedArgs#cmd} to "watchify".
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @returns {boolean}
 */
function parseWatch (args, parsed) {
  let arg = args[0];

  if (arg === '-w' || arg === '--watch') {
    args.shift();
    parsed.cmd = 'watchify';
    return true;
  }
}

/**
 * If the current argument is a sub-argument list,
 * then this function shifts the whole list to {@link ParsedArgs#args}.
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @returns {boolean}
 */
function parseSubArgs (args, parsed) {
  let arg = args[0];

  if (arg === '[') {
    while (arg !== ']') {
      arg = args.shift();
      parsed.args.push(arg);
    }
    return true;
  }
}

/**
 * If the current argument starts with - or --,
 * then this function shifts it to {@link ParsedArgs#args}.
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @returns {boolean}
 */
function parseDashArgs (args, parsed) {
  let arg = args[0];

  if (arg[0] === '-') {
    parsed.args.push(args.shift());
    return true;
  }
}

/**
 * If the current argument is the entry-file glob pattern,
 * then this function parses it and shifts it to {@link ParsedArgs#args}.
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @returns {boolean}
 */
function parseGlobs (args, parsed) {
  let patterns = [];

  if (parsed.globIndex === -1 && glob.hasMagic(args[0])) {
    while (args[0] && args[0][0] !== '-') {
      // We found an entry file glob pattern
      let pattern = args.shift();
      patterns.push(pattern);

      // Set the baseDir, if not already set
      parsed.baseDir = parsed.baseDir || helpers.getBaseDir(pattern);
    }

    if (patterns.length) {
      // We found entry file(s), so set the glob index and create the glob function
      parsed.globIndex = parsed.args.length;
      parsed.args.push((options) => {
        return globby.sync(patterns, options);
      });
    }
  }

  return !!patterns.length;
}

/**
 * This function is called when no other function was able to handle this argument.
 * It just shifts the argument to {@link ParsedArgs#args}.
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @returns {boolean}
 */
function passThrough (args, parsed) {
  parsed.args.push(args.shift());
  return true;
}

/**
 * Parses a name/value argument, such as --outfile, --exclude, etc.
 *
 * @param {string[]} args - The command-line arguments that have not yet been parsed
 * @param {ParsedArgs} parsed - The command-line arguments that have already been parsed
 * @param {string} shortName - The short argument name, such as "-o"
 * @param {string} longName - The long argument name, such as "--outfile"
 * @returns {ParsedArg}
 */
function parseNameValueArg (args, parsed, shortName, longName) {
  let arg = args[0];

  /** @name ParsedArg **/
  let parsedArg = {

    /**
     * If the argument name and value were joined together by an "=",
     * rather than being separated by a space, then this prefix is
     * the part before the value (e.g. "--outfile=", "--exclude=", etc.)
     * @type {string}
     */
    prefix: '',

    /**
     * The argument value.
     * @type {string}
     */
    value: ''
  };

  // Check for space-separated name/value
  if (arg === shortName || arg === longName) {
    // Shift this arg as-is
    parsed.args.push(args.shift());

    // The next arg is the value
    parsedArg.value = args.shift();
    return parsedArg;
  }

  // Check for name/value joined by "="
  shortName += '=';
  longName += '=';
  if (arg.indexOf(shortName) === 0) {
    parsedArg.prefix = shortName;
  }
  else if (arg.indexOf(longName) === 0) {
    parsedArg.prefix = longName;
  }

  if (parsedArg.prefix) {
    let value = args.shift();
    parsedArg.value = value.substr(parsedArg.prefix.length);
    return parsedArg;
  }
}
