
// module: eliminate

exports.deps = [ 'scripts', 'analyze' ];
exports.revdep = [ 'cache.manifest' ];

exports.duty = function (callback) {
  var scripts = this.scripts;
  var analysis = this.analyze;

  var red = function (x) { return '[31m' + x + '[m' };
  var green = function (x) { return '[32m' + x + '[m' };
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
   
    scripts.filter(function (file) {
      if (file.analysis && !(file.filename in reachableGraph)) {
        log(1, bold(red(file.filename)));
        // eliminate file by removing it's requestPath
        delete file.requestPath;
      } else {
        log(1, bold(green(file.filename)), file.analysis);
      };
    });
  };

  callback();
};
