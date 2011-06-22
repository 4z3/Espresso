
// module: eliminate

exports.deps = [ 'scripts', 'analyze', 'sort-by-framework' ];
exports.revdeps = [ 'cache.manifest', 'merge-by-framework' ];

exports.duty = function (callback) {
  var scripts = this.scripts;
  var analysis = this.analyze;

  var red = function (x) { return '[31m' + x + '[m' };
  var green = function (x) { return '[32m' + x + '[m' };
  var yellow = function (x) { return '[33m' + x + '[m' };
  var bold = function (x) { return '[1m' + x + '[m' };
  var log = function (level) {
    //framework.app.log.apply(framework.app, arguments);
    if (level < 2) {
      console.log.apply(this, Array.prototype.slice.call(arguments, 1));
    };
  };
  var reachableGraph = analysis.reachableGraph;

  if (reachableGraph) {
    log(2, 'reachableGraph:', reachableGraph);
   
    scripts.forEach(function (file) {
      if ([ 'ui', 'core', 'app' ].indexOf(file.framework) < 0) {
        log(1, bold(yellow(file.filename)));
        return; // do not eliminate foreign stuff, yet
      };

      if (file.analysis && !(file.filename in reachableGraph)) {
        log(1, bold(red(file.filename)));
        // eliminate file by removing it's requestPath
        delete file.requestPath;
      } else {
        //log(1, bold(green(file.filename)), file.analysis);
        log(1, bold(green(file.filename)));
      };
    });
  };

  callback();
};
