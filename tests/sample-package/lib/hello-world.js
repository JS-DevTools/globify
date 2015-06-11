'use strict';

var _   = require('lodash'),
    say = require('./say');

/**
 * Says hello.
 * @param {string} [name] - Who to say hello to
 */
module.exports = function hello(name) {
  if (_.isString(name)) {
    name = _.startCase(name);
  }
  say('hello', name || 'world');
};
