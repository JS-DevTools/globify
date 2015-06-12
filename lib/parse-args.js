'use strict';

var _       = require('lodash'),
    glob    = require('glob'),
    helpers = require('./helpers');

module.exports = parseArgs;

/**
 * Parses the command-line arguments and replaces glob patterns with functions to expand those patterns.
 *
 * @param {string[]} args
 * @returns {ParsedArgs}
 */
function parseArgs(args) {
  /** @name ParsedArgs **/
  var parsed = {
    /**
     * The command to run ("browserify" or "watchify")
     * @type {string}
     */
    cmd: 'browserify',

    /**
     * The base directory for the entry-file glob pattern.
     * See {@link helpers#getBaseDir} for details.
     * @type {string}
     */
    baseDir: '',

    /**
     * Options for how the entry-file glob pattern should be parsed.
     * For example if an --exclude argument is specified, then `globOptions.ignore` will be set accordingly.
     * @type {object}
     */
    globOptions: {},

    /**
     * The index of the entry-file glob argument.
     * If there is no entry-file argument, or it's not a glob pattern, then this will be -1.
     * @type {number}
     */
    globIndex: -1,

    /**
     * The index of the outfile argument.
     * If there is no outfile argument, or it's not a glob pattern, then this will be -1;
     * @type {number}
     */
    outfileIndex: -1,

    /**
     * The arguments to pass to browserify.
     * If {@link globIndex} or {@link outfileIndex} are set, then the corresponding elements in
     * this array will be the corresponding functions.
     * @type {Array}
     */
    args: []
  };

  args = args || [];
  while (args.length > 0) {
    parseOutfile(args, parsed) ||
    parseExclude(args, parsed) ||
    parseWatch(args, parsed) ||
    parseSubArgs(args, parsed) ||
    parseDashArgs(args, parsed) ||
    parseGlobs(args, parsed) ||
    passThrough(args, parsed);
  }

  return parsed;
}

/**
 * If the current argument is the --outfile argument,
 * then this function parses it and shifts it to {@link ParsedArgs#args}.
 *
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @returns {boolean}
 */
function parseOutfile(args, parsed) {
  var arg = parseNameValueArg(args, parsed, '-o', '--outfile');

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
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @returns {boolean}
 */
function parseExclude(args, parsed) {
  var arg = parseNameValueArg(args, parsed, '-u', '--exclude');

  if (arg) {
    parsed.globOptions.ignore = arg.value;
    parsed.args.push(arg.prefix + arg.value);
    return true;
  }
}

/**
 * If the current argument is the --watch argument,
 * then this function sets {@link ParsedArgs#cmd} to "watchify".
 *
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @returns {boolean}
 */
function parseWatch(args, parsed) {
  var arg = args[0];

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
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @returns {boolean}
 */
function parseSubArgs(args, parsed) {
  var arg = args[0];

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
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @returns {boolean}
 */
function parseDashArgs(args, parsed) {
  var arg = args[0];

  if (_.startsWith(arg, '-')) {
    parsed.args.push(args.shift());
    return true;
  }
}

/**
 * If the current argument is the entry-file glob pattern,
 * then this function parses it and shifts it to {@link ParsedArgs#args}.
 *
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @returns {boolean}
 */
function parseGlobs(args, parsed) {
  var arg = args[0];

  if (parsed.globIndex === -1 && glob.hasMagic(arg)) {
    // We found the entry file glob pattern
    var pattern = args.shift();
    parsed.baseDir = helpers.getBaseDir(pattern);
    parsed.globIndex = parsed.args.length;
    parsed.args.push(glob.sync.bind(glob, pattern));
    return true;
  }
}

/**
 * This function is called when no other function was able to handle this argument.
 * It just shifts the argument to {@link ParsedArgs#args}.
 *
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @returns {boolean}
 */
function passThrough(args, parsed) {
  parsed.args.push(args.shift());
  return true;
}

/**
 * Parses a name/value argument, such as --outfile, --exclude, etc.
 *
 * @param {string[]} args
 * @param {ParsedArgs} parsed
 * @param {string} shortName
 * @param {string} longName
 * @returns {ParsedArg}
 */
function parseNameValueArg(args, parsed, shortName, longName) {
  var arg = args[0];

  /** @name ParsedArg **/
  var parsedArg = {
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
  if (_.startsWith(arg, shortName)) {
    parsedArg.prefix = shortName;
  }
  else if (_.startsWith(arg, longName)) {
    parsedArg.prefix = longName;
  }

  if (parsedArg.prefix) {
    var value = args.shift();
    parsedArg.value = value.substr(parsedArg.prefix.length);
    return parsedArg;
  }
}
