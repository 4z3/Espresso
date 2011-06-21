
// module: analyze

JSLINT = require('../../lib/jslint').JSLINT;
Graph = require('../../lib/graph');

exports.deps = [ 'config', 'scripts' ];
exports.revdep = [ 'cache.manifest' ];

exports.duty = function (callback) {
  var root_filenames = this.root_filenames;
  var scripts = this.scripts;
  var self = this.self;
  var config = this.config;

  //
  // local analysis
  //
  scripts.forEach(function (file) {
    var analysis = file.analysis = {
      definitions: {},
      references: {}
    };

    var result = JSLINT(file.content.toString()); // TODO check result?

    if (typeof JSLINT.tree === 'object') {
      analysis.tree = deep_copy(JSLINT.tree);
      analysis.tree.walk = function (p, f) {
        walk(analysis.tree, p, f);
      };
    };

    var T = deep_copy(JSLINT.tree);

    var the_relevant_parts = ['M', 'm_require', self.name]; // TODO config
    if (config.reachable instanceof Array) {
      config.reachable.forEach(function (name) {
          if (the_relevant_parts.indexOf(name) < 0) {
            the_relevant_parts.push(name);
          };
        });
    };

    // collect <M-REF> X.y
    walk(T,
        function (T) {
          return (T.value === '.' &&
                  T.arity === 'infix' &&
                  Object.keys(T.first).length === 1 && 'value' in T.first &&
                  the_relevant_parts.indexOf(T.first.value) >= 0 &&
                  Object.keys(T.second).length === 1 && 'value' in T.second);
        },
        function (T) {
          T.ref = [T.first.value, T.second.value].join('.');
          T.value = '<M-REF>';
          analysis.references[T.ref] = true;
        });
    // collect <M-REF> X
    walk(T,
        function (T) {
          return (Object.keys(T).length === 1 && 'value' in T &&
                  the_relevant_parts.indexOf(T.value) >= 0);
        },
        function (T) {
          T.ref = T.value;
          T.value = '<M-REF>';
          analysis.references[T.ref] = true;
        });
    // collect <M-DEF>
    walk(T,
        function (T) {
          return (T.value === '=' &&
                  T.arity === 'infix' &&
                  T.first.value === '<M-REF>');
        },
        function (T) {
          T.def = T.first.ref;
          T.value = '<M-DEF>';
          analysis.definitions[T.def] = true;
        });

    analysis.references = Object.keys(analysis.references);
    analysis.definitions = Object.keys(analysis.definitions);

    console.log(file.requestPath, ':', 'analyzed');
  });

  //
  // global analysis
  //
  //var red = this.style.red;
  var red = function (x) {
    return '[32m' + x + '[m';
  };
  var log = function (level) {
    //framework.app.log.apply(framework.app, arguments);
    if (level < 2) {
      console.log.apply(this, Array.prototype.slice.call(arguments, 1));
    };
  };
  var analysis = {};

  // reachable : filename[]
  var reachable = config.reachable;

  // files : { filename -> file }
  var files = {};
  scripts.forEach(function (file) {
    if (file.analysis) { // XXX now they should all
      files[file.filename] = file;
    };
  });
  log(2, 'Object.keys(files).length:', Object.keys(files).length);
  log(2, 'Object.keys(files):', Object.keys(files));
  

  // definitions : { name -> filename }
  var definitions = {};
  Object.keys(files).forEach(function (filename) {
    files[filename].analysis.definitions.forEach(function (definition) {
      // TODO check collisions?
      definitions[definition] = filename;
    });
  });
  log(2, 'Object.keys(definitions).length:', Object.keys(definitions).length);
  log(2, 'Object.keys(definitions):', Object.keys(definitions));
  log(2, 'definitions:', definitions);
  

  // filter predicates
  var relevant_re =
      new RegExp('^(?:m_require|M|' + config.name + ')(?:\\.[^.]+)*$');
  function is_relevant(x) {
    return relevant_re.test(x) || reachable.indexOf(x) >= 0;
  };

  function is_top_or_second_level(name) {
    return name.replace(/[^.]/g, '').length <= 1; // only X and X.y
  };

  function is_Mproject_IDE_hack(name) {
    // fix for the cyclic definition: var app = app || {};
    return name !== config.name;
  };

  var warn_filename = undefined;
  function is_defined(name) {
    if (!(name in definitions)) {
      log(2, red(warn_filename + ': undefined reference: ' + name));
    } else if (!definitions[name]) {
      log(2, red(warn_filename + ': bad definition: ' + name));
    } else {
      return name in definitions;
    };
  };

  function name_to_filename(name) {
    return definitions[name];
  };

  // dependency_graph : { filename -> filename }
  var dependency_graph = {};
  Object.keys(files).forEach(function (filename) {
    warn_filename = filename;
    dependency_graph[filename] = {};

    // all references
    files[filename].analysis.references.forEach(function (name) {
      all_parts(name, true)
          .filter(is_top_or_second_level)
          .filter(is_relevant)
          .filter(is_Mproject_IDE_hack)
          .filter(is_defined)
          .map(name_to_filename)
          .forEach(function (def_filename) {
            dependency_graph[filename][def_filename] = true;
          });
    });

    // for all property definitions X.y : reference X
    files[filename].analysis.definitions.forEach(function (name) {
      all_parts(name, false)
          .filter(is_top_or_second_level)
          .filter(is_relevant)
          .filter(is_Mproject_IDE_hack)
          .filter(is_defined)
          .map(name_to_filename)
          .forEach(function (def_filename) {
            dependency_graph[filename][def_filename] = true;
          });
    });

    dependency_graph[filename] = Object.keys(dependency_graph[filename]);
  });
  log(2, 'Object.keys(dependency_graph).length:', Object.keys(dependency_graph).length);
  log(2, 'dependency_graph:', dependency_graph);
  

  // root_filenames : filename[]
  var root_filenames = this.scripts.filter(function (file) {
    return file.is_root_file;
  }).map(function (file) {
    return file.filename;
  });

  reachable
      .filter(is_top_or_second_level)
      .filter(is_relevant)
      .filter(is_Mproject_IDE_hack)
      .filter(is_defined)
      .map(name_to_filename)
      .forEach(function (filename) {
        if (root_filenames.indexOf(filename) < 0) {
          log(3, 'reachable by config:', filename);
          root_filenames.push(filename);
        };
      });
  log(2, 'root_filenames:', root_filenames);
  

  // reachable_filenames : filename[]
  var reachable_filenames = Graph.reach(dependency_graph, root_filenames);
  log(2, 'reachable_filenames.length:', reachable_filenames.length);
  log(2, 'reachable_filenames:', reachable_filenames);
  

  // reachable_graph : { filename -> filename }
  var reachable_graph = {};
  reachable_filenames.forEach(function (filename) {
    reachable_graph[filename] = dependency_graph[filename];
  });
  reachable_graph = Graph.withoutReflexion(reachable_graph);
  log(2, 'reachable_graph:', reachable_graph);
  analysis.reachableGraph = reachable_graph;
  

  callback(analysis);
};

/**
 * Properties of the AST generated by JSLint, that should be recognized by
 * {@link deep_copy} and {@link walk}.
 */
The_relevant_parts = [
  'value',  'arity', 'name',  'first',
  'second', 'third', 'block', 'else'
];

/**
 * Copy a tree.  Only {@link The_relevant_parts} get copied.
 * @param {tree}
 * @returns {tree} fresh copy of the tree
 */
function deep_copy(T) {
  return JSON.parse(JSON.stringify(T, The_relevant_parts));
};

/**
 * Walk a tree and execute a function whenever the predicate returns true.
 * The function can be used to modify the tree (in place).
 *
 * @param {tree}
 * @param {predicate}
 * @param {function}
 */
function walk(T, p, f) {
  if (typeof T === 'object') {
    if (T instanceof Array) {
      T.forEach(function (T) {
        walk(T, p, f);
      });
    } else if (p(T)) {
      f(T);
    } else {
      walk_children(T, p, f);
    };
  };
};

function walk_children(T, p, f) {
  The_relevant_parts.forEach(function (part) {
    walk(T[part], p, f);
  });
};


// X.foo.bar.baz -> X, X.foo, X.foo.bar [, X.foo.bar.baz]
function all_parts(x, reflexive) {
  var parents = [];
  var match = /^([^.]+(?:\.[^.]+)*)$/.exec(x);
  if (match) {
    var parts = match[1].split('.');
    for (var i = 1, n = parts.length + (reflexive ? 1 : 0); i < n; ++i) {
      parents.push(parts.slice(0, i).join('.'));
    };
  };
  return parents;
};

