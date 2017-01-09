(function e (t, n, r) { function s (o, u) { if (!n[o]) { if (!t[o]) { let a = typeof require === 'function' && require; if (!u && a) { return a(o, !0); } if (i) { return i(o, !0); } let f = new Error("Cannot find module '" + o + "'"); throw f.code = 'MODULE_NOT_FOUND', f; } let l = n[o] = { exports: {}}; t[o][0].call(l.exports, function (e) { let n = t[o][1][e]; return s(n ? n : e); }, l, l.exports, e, t, n, r); } return n[o].exports; } let i = typeof require === 'function' && require; for (let o = 0; o < r.length; o++) { s(r[o]); } return s; }({ 1: [function (require, module, exports) {
  'use strict';

/**
 * Says something to somebody.
 * @param {string} what - What to say
 * @param {string} [who] - Who to say goodbye to
 */
  module.exports = function say (what, who) {
    console.log('%s, %s!', what, who);
  };


}, {}]}, {}, [1]));
