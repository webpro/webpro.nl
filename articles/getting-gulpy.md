---
published: 2014-05-05
modified: 2022-02-26
description:
  Common pitfalls when using gulp.js, plugins and streams in a more advanced and
  custom way.
---

# Getting gulpy

## Advanced tips for using gulp.js

After getting excited about [gulp.js][1], at some point you need more than the
shiny but basic examples. This post discusses some common pitfalls when using
gulp.js, plugins and streams in a more advanced and custom way.

## Basic tasks

In a basic setup, gulp has a nice syntax to use streams and plugins to transform
your source files:

```js
gulp.task('scripts', function () {
  return gulp
    .src('./src/**/*.js')
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('build/'));
});
```

This works just fine in many cases, but once you need something more tailored,
you may soon face tricky situations. This post addresses some of them.

## Incompatible streams?

When using gulp you may have run into the issue of "incompatible streams". This
mostly has to do with the difference of regular streams versus vinyl file
objects, and gulp plugins that use libraries supporting only buffers (and not
streams).

For example, you can't pipe a regular Node stream directly to gulp and/or gulp
plugins. Let's take a read stream, transform the contents using [gulp-uglify][2]
and [gulp-rename][3], and finally write the result to disk with `gulp.dest()`.
Consider this (erroneous) example:

```js
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('bundle', function () {
  return fs
    .createReadStream('app.js')
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('dist/'));
});
```

Why can't we pipe a read stream to a gulp plugin? Gulp is the _streaming_ build
system after all, right? Yes, but the example above ignores the fact that gulp
plugins expect Vinyl file objects. You can't just pipe a read stream to a
function (plugin) that expects vinyl file object(s).

## The vinyl file object

Gulp uses [vinyl-fs][4], from which it inherits the `gulp.src()` and
`gulp.dest()` methods. Vinyl-fs uses the [vinyl][5] file object, its "virtual
file format". If we want to use gulp and/or gulp plugins with a regular read
stream, we need to convert the read stream to vinyl first.

A great option is to use [vinyl-source-stream][6], which does exactly that:

```js
var source = require('vinyl-source-stream');
var marked = require('gulp-marked');

fs.createReadStream('*.md')
  .pipe(source())
  .pipe(marked())
  .pipe(gulp.dest('dist/'));
```

The next example starts with a [Browserified][7] bundle and eventually converts
this to a vinyl stream.

```js
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');

gulp.task('bundle', function () {
  return browserify('./src/app.js')
    .bundle()
    .pipe(source('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});
```

Great. Note that we don't need to use gulp-rename anymore, since
vinyl-source-stream creates a vinyl file instance with the specified filename
(which gulp.dest will use to write the bundle).

**gulp.dest**

This gulp method creates a write stream, and is really convenient. It reuses the
file names from the read stream, and creates directories (using [mkdirp][8]) as
necessary. After writing, you can continue piping the stream (e.g. to also gzip
the data and write the result to other files).

## Streams and buffers

Since you're interested in using gulp, this post simply assumes you have some
basic knowledge of streams. Vinyl works with virtual files containing either a
buffer or a stream (or `null`). With a regular read stream you can listen to
emitted chunks of data:

```js
fs.createReadStream('/usr/share/dict/words').on('data', function(chunk) {
    console.log('Read %d bytes of data', chunk.length);
});

> Read 65536 bytes of data
> Read 65536 bytes of data
> Read 65536 bytes of data
> Read 65536 bytes of data
> ...
```

In contrast, `gulp.src()` emits `buffered` vinyl file objects back to the
stream. This means you won't get chunks, but (virtual) files with buffered
contents. The vinyl file format has a `contents` property representing a buffer
or a stream, and gulp is using buffers by default:

```js
gulp.src('/usr/share/dict/words').on('data', function(file) {
    console.log('Read %d bytes of data', file.contents.length);
});

> Read 2493109 bytes of data
```

This clearly shows the data is buffered before the file gets emitted to the
stream as a whole.

## Gulp uses buffers by default

Although in general it's recommended to stream the data, many plugins have
underlying libraries that work with buffers. Sometimes this is simply necessary
for transformations that require the source contents as a whole. Consider for
instance text-based replacements with regular expressions. You would run the
risk of matching patterns being in separate chunks, failing to find those
matches. Likewise, tools like [UglifyJS][9] and the [Traceur compiler][10] need
complete files as their input (or at least syntactically complete strings of
JavaScript).

This is why gulp is using buffered streams by default, since they're just easier
to work with.

The downside of using buffered content is that they are inefficient for large
files. The file is read completely, before it is emitted back to the stream. The
question is, for which file sizes does this really hurt performance? For regular
text files such as JavaScript, CSS, templates, etcetera there's likely just
minimal overhead in using buffers.

In any case, you can tell gulp to pass on a stream for `contents` if you set the
`buffer` option to `false`. Here's a contrived example:

```js
gulp.src('/usr/share/dict/words', {buffer: false}).on('data', function(file) {
    var stream = file.contents;
    stream.on('data', function(chunk) {
        console.log('Read %d bytes of data', chunk.length);
    });
});

> Read 65536 bytes of data
> Read 65536 bytes of data
> Read 65536 bytes of data
> Read 65536 bytes of data
> ...
```

## From streams to buffers

Depending on the desired input (and output) stream, and depending on the gulp
plugin, you may need to switch from streams to buffers (or vice versa). As said,
most plugins work with buffers (although some of them also support streams).
Examples include [gulp-uglify][2] and [gulp-traceur][11]. You can do the
conversion to buffers using [gulp-buffer][12]:

```js
var source = require('vinyl-source-stream');
var buffer = require('gulp-buffer');
var uglify = require('gulp-uglify');

fs.createReadStream('./src/app.js')
  .pipe(source('app.min.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('dist/'));
```

Or, another contrived example:

```js
var buffer = require('gulp-buffer');
var traceur = require('gulp-traceur');

gulp
  .src('app.js', { buffer: false })
  .pipe(buffer())
  .pipe(traceur())
  .pipe(gulp.dest('dist/'));
```

## From buffers to streams

You can also "streamify" the output of a plugin working with buffers (back) to a
read stream by using [gulp-streamify][13] or [gulp-stream][14]. Then plugins
that work (only) with streams can be used before and after the buffer-based
plugin:

```js
var wrap = require('gulp-wrap');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');

gulp
  .src('app.js', { buffer: false })
  .pipe(wrap('(function(){<%= contents %>}());'))
  .pipe(streamify(uglify()))
  .pipe(gulp.dest('build'))
  .pipe(gzip())
  .pipe(gulp.dest('build'));
```

## You don't need a plugin for everything

Although there are many plugins out there that are very useful and convenient,
some tasks and transformations can easily be done without Yet Another Plugin™.
Plugins do cause some overhead in that they make you depending on an extra npm
module, a plugin interface, (unresponsive?) maintainer, etc. If it's very easy
to do the task at hand without a plugin, or to directly use the original module,
then in most cases I would recommend to do so. It's important to understand the
concepts I've described above to make the right decision in your situation.
Let's take a look at some examples.

**vinyl-source-stream**

In our examples above we've already seen an example of using Browserify directly
instead of the (blacklisted) [gulp-browserify][15] plugin. The key here is to
use vinyl-source-stream (or similar) to allow for regular read streams as input
to Vinyl plugins.

**Textual transformations**

Another example is string-based transformations. Here is a very basic plugin to
use directly with vinyl buffers:

```js
function modify(modifier) {
  return through2.obj(function (file, encoding, done) {
    var content = modifier(String(file.contents));
    file.contents = new Buffer(content);
    this.push(file);
    done();
  });
}
```

You could use this plugin like this:

```js
gulp.task('modify', function () {
  return gulp
    .src('app.js')
    .pipe(modify(version))
    .pipe(modify(swapStuff))
    .pipe(gulp.dest('build'));
});

function version(data) {
  return data.replace(/\_\_VERSION\_\_/, pkg.version);
}

function swapStuff(data) {
  return data.replace(/(\\w+)\\s(\\w+)/, '$2, $1');
}
```

The plugin is unfinished and doesn't even deal with streams ([more complete
version][16]). However, it shows it's possibly easy to create new
transformations using some basic functions. The [through2][17] library is a
great wrapper to Node streams and enables transform functions as shown above.

## Task orchestration

In case you need some custom or dynamic tasks to run, it's useful to know that
gulp is using the [Orchestrator][18] module. The gulp.add method is
Orchestrator.add (actually all methods are inherited from the Orchestrator
module). But, why would you need this?

- You don't want to clutter the list of gulp tasks with "private" tasks (i.e.
  not exposing them to the CLI tool).
- You need more dynamic and/or reusable sub-tasks.

## Closing thoughts

Please note that gulp itself (or Grunt) itself is not always the best tool for
the job. If, for instance, you just need to concatenate and uglify a couple of
Javascript files, or you need to compile some SASS files, you may want to
consider using Makefiles or npm run and get _a lot_ done from the command line.
Less dependencies and less configuration can be truly liberating.

Read up on [Task automation with npm run][19] to learn more. Just make sure you
define clearly what you need on a scale of "build customization", and what would
be the best tool(s) for the job.

However, I think gulp is a great build system that I love to use and really
introduced to me the power of streams in Node.js.

Hope this helps! If you have any feedback or additional tips, please let me know
in the comments or Twitter: [@webprolific][20].

[1]: http://gulpjs.com
[2]: https://www.npmjs.org/package/gulp-uglify
[3]: https://www.npmjs.org/package/gulp-rename
[4]: https://github.com/wearefractal/vinyl-fs
[5]: https://github.com/wearefractal/vinyl
[6]: https://www.npmjs.org/package/vinyl-source-stream
[7]: https://browserify.org
[8]: https://www.npmjs.org/package/mkdirp
[9]: https://lisperator.net/uglifyjs/
[10]: https://github.com/google/traceur-compiler
[11]: https://www.npmjs.org/package/gulp-traceur
[12]: https://www.npmjs.org/package/gulp-buffer
[13]: https://www.npmjs.org/package/gulp-streamify
[14]: https://www.npmjs.org/package/gulp-stream
[15]: https://www.npmjs.org/package/gulp-browserify
[16]: https://gist.github.com/webpro/a9a9e14d291c021894b3
[17]: https://www.npmjs.org/package/through2
[18]: https://www.npmjs.org/package/orchestrator
[19]: http://substack.net/task_automation_with_npm_run
[20]: https://twitter.com/webprolific
