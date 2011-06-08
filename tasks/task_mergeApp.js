/*!
 * task_mergeApp.js
 *
 * Copyright 2011, Panacoda GmbH.  All rights reserved.
 * This file is licensed under the MIT license.
 *
 * @author tv
 */

var Task = require('./task').Task;
var Task_Merge = require('./task_merge').Task_Merge;
var Graph = require('../lib/graph');

/**
 * @class
 * This Task appends all cached and reachable files to the framework and
 * delegates merging to Task_Merge.
 *
 * @extends Task
 */
var Task_MergeApp = exports.Task = function () {
  this.name = 'mergeApp';
};

Task_MergeApp.prototype = new Task();

Task_MergeApp.prototype.duty = function duty(framework, callback) {
  // get global state
  var _defs = framework.app.globalState.definitions;
  var _refs = framework.app.globalState.references;
  var _files = framework.app.globalState.files;

  // reduce references
  Object.keys(_refs).forEach(function (path) {
    var new_refs = {};

    // X.foo.bar is X.foo
    _refs[path].forEach(function (ref) {
      var match = /^([^.]+(?:\.[^.]+))(?:\.[^.]+)+$/.exec(ref);
      var new_ref = match ? match[1] : ref;
      if (!(new_ref in new_refs)) {
        new_refs[new_ref] = true;
      };
    });

    // Only ^(M|{framework.app.name}).* is relevant^_^
    var re = new RegExp('^(M|' + framework.app.name + ')(?:\\.[^.]+)$');
    _refs[path] = Object.keys(new_refs).filter(function (ref) {
      return re.test(ref);
    });
  });

  // construct file dependency graph
  var _deps = {};
  Object.keys(_refs).forEach(function (path) {
    _deps[path] = {};
    _refs[path].forEach(function (ref) {
      _deps[path][_defs[ref]] = true;
    });
    _deps[path] = Object.keys(_deps[path]);
  });

  // collect root files
  var _root_files = {};
  framework.files.forEach(function (file) {
    _refs[file.path].forEach(function (ref_key) {
      // root files are all files, that define objects used by this framework
      // (where this framework is "the Application").
      _root_files[_defs[ref_key]] = true;
    });
  });
  if (typeof framework.app.deadCodeElimination !== 'boolean') {
    // By contract framework.app.deadCodeElimination is either a boolean or
    // an array of (fully qualified) object names (e.g. M.Application).
    // If it is not a boolean, then iterate over all the names, and collect
    // add their defining files to the root files.
    framework.app.deadCodeElimination.forEach(function (key) {
      _root_files[_defs[key]] = true;
    });
  };
  _root_files = Object.keys(_root_files);

  //console.log('DEPENDENCY GRAPH');
  //console.log(_deps);

  //console.log('DEFINITIONS');
  //console.log(Object.keys(_refs).length);
  //console.log(Object.keys(_refs));

  //console.log('REFERENCES');
  //console.log(reach(_deps, _root_files).length);
  //console.log(reach(_deps, _root_files));

  //console.log('FRAMEWORK FILES');
  //console.log(framework.files.map(function (f) { return f.path }));

  // compute set of all reachable files
  var _reachable = {};
  Graph.reach(_deps, _root_files).forEach(function (path) {
    _reachable[path] = _deps[path];
  });

  // cache framework files
  framework.files.forEach(function (file) {
    _reachable[file.path] = _deps[file.path];
    _files[file.path] = file;
  });
  framework.files = [];

  // push all cached and reachable files to this framework
  Graph.tsort(Graph.withoutReflexion(_reachable)).forEach(function (path) {
    framework.files.push(_files[path]);
  });

  // delegate
  Task_Merge.prototype.duty.call(this, framework, callback);
};

/**
 * @description
 * The application can be merged when all core files are built.
 */
Task_MergeApp.prototype.isReadyToRun = function (framework) {
  var _ready = false;

  // get global state
  var _builtFrameworks = framework.app.globalState.builtFrameworks;

  if (_builtFrameworks) {
    _ready = true;
    framework.app.coreFrameworks.forEach(function (dep) {
      if (!_builtFrameworks[dep]) {
        _ready = false;
      };
    });
  };
  return _ready;
};
