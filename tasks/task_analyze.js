/*!
 * task_analyze.js
 *
 * Copyright 2011, Panacoda GmbH.  All rights reserved.
 * This file is licensed under the MIT license.
 *
 * @author tv
 */

Task = require('./task').Task;
JSLINT = require('../lib/jslint').JSLINT;

/**
 * @class
 * Analyze framework files and put the results into the analysis-property.
 *
 * @extends Task
 */
Task_Analyze = exports.Task = function () {
  this.name = 'analyze';
};

Task_Analyze.prototype = new Task();

Task_Analyze.prototype.duty = function duty(framework, callback) {
  framework.files.forEach(function (file) {
    if (file.analysis) {
      // TODO proper warning
      console.log('file already analyzed:', file.path);
    } else {
      file.analysis = {
        definitions: { immediate: [], runtime: [] },
        references: { immediate: [], runtime: [] }
      };

      var result = JSLINT(file.content.toString());

      //console.log('[3' + (result ? 2 : 1) + 'mJSLINT', file.path + '[m');

      var T = deep_copy(JSLINT.tree);

      (function (tmp, tree) {
        tree = deep_copy(T);

        // Collect all definitions and references.
        tmp = collect_definitions_and_references(tree);
        Object.keys(tmp.definitions).forEach(function (x) {
          file.analysis.definitions.runtime.push(x);
        });
        Object.keys(tmp.references).forEach(function (x) {
          file.analysis.references.runtime.push(x);
        });

        // Collect only immediate definitions and references,
        // i.e. anything, that's not inside a (non-applied) function.
        // Note that immediates are a subset of runtimes.
        //  XXX could/should we analyze for immediate-onlys?
        prune_functions(tree);
        tmp = collect_definitions_and_references(tree);
        Object.keys(tmp.definitions).forEach(function (x) {
          file.analysis.definitions.immediate.push(x);
        });
        Object.keys(tmp.references).forEach(function (x) {
          file.analysis.references.immediate.push(x);
        });
      })();

      // dump
      //console.log('[35;1m^L[m');
      //console.log(file.path, '=')
      //console.log(require('sys').inspect({
      //  tree: T,
      //  analysis: file.analysis,
      //  path: file.path
      //}, false, 100));
    };
  });

  // definitions map file paths to object names, that are defined in the
  // respective file.
  if (!framework.app.globalState.definitions) {
    framework.app.globalState.definitions = {};
  };
  framework.files.forEach(function (file) {
    file.analysis.definitions.runtime.forEach(function (x) {
      //console.log(file.path, 'defines', x);
      // TODO if x already in definitions then bail out(?)
      framework.app.globalState.definitions[x] = file.path;
    });
  });

  // references map object names to file paths, that are 
  if (!framework.app.globalState.references) {
    framework.app.globalState.references = {};
  };
  framework.files.forEach(function (file) {
    var refs = framework.app.globalState.references[file.path] = [];
    file.analysis.references.runtime.forEach(function (x) {
      //console.log(file.path, 'references', x);
      refs.push(x);
    });
  });

  callback(framework);
};

// Library for Task_Analyze

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
 * Walk over a tree and prune all sub-trees that are functions.
 * @param {tree}
 * @returns {tree} pruned tree
 */
function prune_functions(T) {
  walk(T,
    function (T) { return T.value === 'function' },
    function (T) {
      var value = T.value;
      var name = T.name;
      prune(T);
      T.value = '<pruned:' + value + (name ? ':' + name : '') + '>';
    });
};

/**
 * Walk over a tree an collect all definitions and references.
 * @param {tree}
 * @returns {object} contains all sub-trees that are definitions or references
 */
function collect_definitions_and_references(T) {
  // Let's get a copy, so we can modify it at will.
  // This effectively makes this a functional function, hell yeah!^_^
  T = deep_copy(T);

  // Mark all "dotted" references, i.e. This.here is dotted.
  walk(T,
      is_dotted,
      function (T) {
        var ref = dot(T);
        prune(T);
        T.value = '<ref>';
        T.first = ref;
      });

  // Mark all "undotted" references, i.e. This is undotted.
  walk(T,
      function (T) {
        return (Object.keys(T).length === 1
            && 'value' in T
            && /^\w+$/.test(T.value));
      },
      function (T) {
        var ref = [T.value];
        prune(T);
        T.value = '<ref>';
        T.first = ref;
      });

  // Mark definitions.  Note that this turns references into definitions.
  walk(T,
      function (T) { return T.value === '=' },
      function (T) {
        if (T.first.value === '<ref>') {
          var def = T.first.first;
          var second = T.second;
          prune(T);
          T.value = '<def>';
          T.first = def;
          T.second = second;
        };
      });

  // Collect the marked stuff.
  var defs = {};
  var refs = {};
  walk(T,
      function (T) { return T.value === '<def>' },
      function (T) {
        defs[T.first.join('.')] = T.first;
      });
  walk(T,
      function (T) { return T.value === '<ref>' },
      function (T) {
        refs[T.first.join('.')] = T.first;
      });

  return { definitions: defs, references: refs };
};

/**
 * Prune a tree.
 * @param {tree}
 * @returns {tree} empty object, i.e. an object with all properties deleted
 */
function prune(T) {
  Object.keys(T).forEach(function (k) {
    delete T[k];
  });
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
  (function _walk(T) {
    if (typeof T === 'object') {
      if (T instanceof Array) {
        T.forEach(_walk);
      } if (p(T)) {
        f(T);
      } else {
        The_relevant_parts.forEach(function (k) {
          _walk(T[k]);
        });
      };
    };
  })(T);
};

/**
 * Flatten a sub-tree with "."-values into an array.
 * @param {tree}
 * @returns {object[]}
 */
function dot(T) {
  if (is_dotted(T)) {
    var y = [];
    dot(T.first ).forEach(function (x) { y.push(x) });
    dot(T.second).forEach(function (x) { y.push(x) });
    return y;
  } else {
    return [T.value];
  };
};

/**
 * Predicate that check whether a tree is a "dotted" reference.
 */
function is_dotted(T) {
  return T.value === '.' && T.arity === 'infix';
};
