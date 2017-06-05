Globify
============================
#### Run browserify and watchify with globs - even on Windows!

[![Build Status](https://api.travis-ci.org/BigstickCarpet/globify.svg?branch=master)](https://travis-ci.org/BigstickCarpet/globify)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/bigstickcarpet/globify?svg=true&branch=master&failingText=Windows%20build%20failing&passingText=Windows%20build%20passing)](https://ci.appveyor.com/project/BigstickCarpet/globify)

[![Coverage Status](https://coveralls.io/repos/BigstickCarpet/globify/badge.svg?branch=master&service=github)](https://coveralls.io/r/BigstickCarpet/globify)
[![Codacy Score](https://www.codacy.com/project/badge/d285fbd0aa424bae8d5d7fd3be7593be)](https://www.codacy.com/public/jamesmessinger/globify)
[![Inline docs](http://inch-ci.org/github/BigstickCarpet/globify.svg?branch=master&style=shields)](http://inch-ci.org/github/BigstickCarpet/globify)
[![Dependencies](https://david-dm.org/BigstickCarpet/globify.svg)](https://david-dm.org/BigstickCarpet/globify)

[![npm](http://img.shields.io/npm/v/globify.svg)](https://www.npmjs.com/package/globify)
[![License](https://img.shields.io/npm/l/globify.svg)](LICENSE)


Features
--------------------------
* Supports [glob patterns](https://github.com/isaacs/node-glob#glob-primer) for entry files - even on Windows
* Optionally create separate browserify bundles for each entry file


Related Projects
--------------------------
* [simplifyify](https://www.npmjs.com/package/simplifyify) - A simplified Browserify and Watchify CLI
* [sourcemapify](https://www.npmjs.com/package/sourcemapify) - Sourcemap plugin for Browserify
* [browserify-banner](https://www.npmjs.com/package/browserify-banner) - Add a comment (and/or code) to the top of your Browserify bundle


Installation
--------------------------
Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm).  Add the `-g` flag to install globally so you can use it from any terminal.

```bash
npm install -g globify
```


Usage
--------------------------
The command-line interface is identical to [browserify](https://github.com/substack/node-browserify#usage) and [watchify](https://github.com/substack/watchify#usage).  In fact, globify simply passes your arguments straight to browserify or watchify (after expanding the glob pattern).

```bash
globify <entry files glob>  [options]

Options:

  <entry files glob>

    Glob pattern of entry files. Don't forget to wrap the glob pattern in quotes,
    otherwise some shells (like bash) will pre-expand the glob.

  --outfile=FILE, -o FILE

    If outfile is a file, then a single bundle will be created.  If it's a directory,
    then separate bundles will be created for each entry file.  You can also specify
    an output filename pattern, like *.bundled.js

  --exclude=GLOB, -u GLOB

    Excludes files that are matched by the <entry files glob>

  --watch, -w

    Call watchify instead of browserify.
```


Examples
--------------------------
For all of these examples, assume that we have a file structure like this:

```
lib/
 |__ my-entry-file.js
 |__ some-file.js
 |__ other-file.js
 |__ other-entry-file.js
 |__ subdir/
       |__ another-entry-file.js
       |__ another-file.js
       |__ yet-another-file.js
```

#### Multiple files in one bundle
We want to bundle all three entry files into a single bundle file.  We can do that with the following command:

```
globify "lib/**/*-entry-file.js" --outfile=dist/my-bundle.js
```

Globify will call `browserify` once, passing it the three matching entry files and one bundle file:

```
browserify lib/my-entry-file.js lib/other-entry-file.js lib/subdir/another-entry-file.js --outfile=dist/my-bundle.js
```

#### Multiple files, multiple bundles
We want to create separate bundle files for each of the three entry files.  We can do that with the following command:

```
globify "lib/**/*-entry-file.js" --outfile=dist
```

Globify will call `browserify` three times (once for each entry file), and create three corresponding bundles:

```
browserify lib/my-entry-file.js --outfile=dist/my-entry-file.js
browserify lib/other-entry-file.js --outfile=dist/other-entry-file.js
browserify lib/subdir/another-entry-file.js --outfile=dist/subdir/another-entry-file.js
```

#### Multiple files, multiple bundles with customized names
We want to create separate bundle files for each of the three entry files, but we weant each bundle file to have a `.bundled.js` suffix.  We can do that with the following command:

```
globify "lib/**/*-entry-file.js" -o "dist/*.bundled.js"
```

Globify will call `browserify` three times (once for each entry file) and create three corresponding bundles:

```
browserify lib/my-entry-file.js -o dist/my-entry-file.bundled.js
browserify lib/other-entry-file.js -o dist/other-entry-file.bundled.js
browserify lib/subdir/another-entry-file.js -o dist/subdir/another-entry-file.bundled.js
```

#### Watchify, transforms, other options
Now, let's try it with watchify instead.  Let's also add some extra options, and run the `uglifyify` transforms to minify the bundles. And let's give the bundles a `.bundled.min.js` suffix.

```
globify -g uglifyify "lib/**/*-entry-file.js" -w -v -d -o "dist/*.bundled.min.js"
```

Globify will call `watchify` (because of the `-w` option) three times with all of the specified options:

```
watchify -g uglifyify lib/my-entry-file.js -v -d -o dist/my-entry-file.bundled.min.js
watchify -g uglifyify lib/other-entry-file.js -v -d -o dist/other-entry-file.bundled.min.js
watchify -g uglifyify lib/subdir/another-entry-file.js -v -d -o dist/subdir/another-entry-file.bundled.min.js
```


Contributing
--------------------------
I welcome any contributions, enhancements, and bug-fixes.  [File an issue](https://github.com/BigstickCarpet/globify/issues) on GitHub and [submit a pull request](https://github.com/BigstickCarpet/globify/pulls).

#### Building/Testing
To build/test the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/BigstickCarpet/globify.git`

2. __Install dependencies__<br>
`npm install`

3. __Run the build script__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`


License
--------------------------
Globify is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.
