
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
          var prefix;

          // TODO don't hard code:
          var path = [
            config.applicationDirectory + '/',
            config.applicationDirectory + '/frameworks/The-M-Project/modules/',
          ];


          // TODO this must already be in config! AKA search path
          if ('libraries' in config) {
            config.libraries.forEach(function (lib) {
              // TODO honor refs; we're now assuming "refs": ["*"]
              path.push(config.applicationDirectory + '/frameworks/' + lib.name + '/');
            });
          };

          // Find file corresponding to the m_require()d name. 
          var name = T.second[0].value;
          path.forEach(function (cand) {
            if (cand + name in config.files) {
              prefix = cand;
            };
          });
          if (!prefix) {
            console.error(
              'Error: bad m_require(' + JSON.stringify(name) + ') in '
              + file.filename);
          } else {
            dependency_graph[file.filename].push(prefix + name);
          };
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
