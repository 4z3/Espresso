
// module: minify

exports.deps = [ 'scripts' ];
exports.revdeps = [ 'index.html' ];

spawn = require('child_process').spawn;
join = require('path').join;

exports.duty = function (callback) {

  // TODO check if we want to minify actually

  var count = this.scripts.length;
  if (count > 0) {
    this.scripts.forEach(function (file) {
      console.log('minifying', file.filename + '...');

      var orig_len = file.content.length;

      var data = '';
      var stderr = '';

      var minify = spawn('java', [
        '-jar'
        , join(__dirname, '..', '..', 'bin', 'compiler.jar')
        , '--compilation_level', 'SIMPLE_OPTIMIZATIONS'
        , '--warning_level', 'QUIET'
      ]);

      minify.stdout.on('data', function (chunk) {
        data += chunk;
      });

      minify.stderr.on('data', function (chunk) {
        stderr += chunk;
      });

      minify.on('exit', function (code) {
        if (code !== 0) {
          console.log('not minified', file.filename + ': error code = ' + code);
        } else {
          file.content = data;
          console.log('minified', file.filename + ':'
              , orig_len, '->', file.content.length);
        };
        if (stderr.length > 0) {
          console.log('minified', file.filename + ': stderr:\n' + stderr);
        };
        if (--count === 0) {
          callback();
        };
      });

      minify.stdin.write(file.content);
      minify.stdin.end();
    });
  } else {
    callback();
  };
};
