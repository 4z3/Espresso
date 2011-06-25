
// module: sort-by-m_require

Graph = require('../../lib/graph');

exports.deps = [ 'config', 'scripts', 'files', 'analyze' ];
exports.revdeps = [ 'index.html' ];

exports.duty = function (callback) {
  var config = this.config;

  var dependency_graph = {};

  this.scripts.forEach(function (file) {

    dependency_graph[file.filename] = [];

    if (file.analysis.tree) {
      file.analysis.tree.walk(
        function (T) {
          return (T.first instanceof Object &&
                  Object.keys(T.first).length === 1 && 'value' in T.first &&
                  T.first.value === 'm_require' &&
                  T.second instanceof Array &&
                  T.second.length === 1 &&
                  T.second[0] instanceof Object &&
                  T.second[0].arity === 'string' &&
                  typeof T.second[0].value === 'string'
                  // TODO and there's nothing else in T.second[0]
                  // TODO bail out if T seems quite good but isn't...
                  );
        },
        function (T) {
          // TODO get prefix from file
          var prefix;
          [
            config.applicationDirectory + '/',
            config.applicationDirectory + '/frameworks/The-M-Project/modules/',
          ].forEach(function (cand) {
            if (file.filename.slice(0, cand.length) === cand) {
              prefix = cand;
            };
          });
          dependency_graph[file.filename].push(prefix + T.second[0].value);
        });
    };
  });

  console.log(dependency_graph);
  var sorted_scripts = Graph.tsort(dependency_graph);

  console.log();
  console.log();
  console.log('tsorted:', sorted_scripts);

  var scripts = this.scripts;
  var files = this.files;

  while (this.scripts.length > 0) {
    scripts.pop();
  };

  sorted_scripts.forEach(function (filename) {
    var file = files[filename];
    scripts.push(file);
  });

  callback(dependency_graph);
};
