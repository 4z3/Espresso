// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: 2011 M-Way Solutions GmbH. All rights reserved.
// Creator:   alexander
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

/*
 * import dependencies 
 */
var Fs = require('fs');
var Util = require('util');
var Path = require('path');
var Sequencer = require('step');
var Style = require('../lib/color');
var File = require('../core/file').File;
var Renderer = require('../lib/renderer');

// TODO: Implement transaction mechanism to roll back on error

var generate = exports.generate = function generate(options) {
  var espressoPath = __dirname + '/..';
  var templatePath = __dirname + '/templates';   
  var templateRenderer = Renderer.createRenderer(templatePath);
  var tools = ['config.json']; // array with names of build tools, used in the a new project.
  var outPut = [];
  var path;

  /* Properties */
  var projectName = options.project;
  var isHelloWorldProject = options.example;

  if (options.directory === "$PWD") {
    path = process.cwd() + '/';
  } else {
    path = options.directory + '/';
  }

  /* Output dirs */
  outPut.push(path + projectName);
  outPut.push(path + projectName + '/app');
  outPut.push(path + projectName + '/app/resources');
  outPut.push(path + projectName + '/app/resources/base');    
  outPut.push(path + projectName + '/frameworks');
  outPut.push(path + projectName + '/frameworks/The-M-Project');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/bootstrapping');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/core');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/core/datastore');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/core/datastore/validators');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/core/foundation');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/core/utility');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/core/utility/cypher_algorithms');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/ui');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/ui/dialogs');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/jquery');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/jquery_mobile');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/jquery_mobile_plugins');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/jquery_mobile_plugins/datepicker');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/themes');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/themes/jquery_mobile');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/themes/jquery_mobile/images');
  outPut.push(path + projectName + '/frameworks/The-M-Project/modules/underscore');

  /**
   * Helper to generate the folder structure for a new project.
   * @param callback, calling the next helper.
   */
  var makeProjectDir = function makeProjectDir(callback) {
    var projectPath = outPut.shift();
    var folderCount = outPut.length;

    function callbackIfDone() {
      if (folderCount === 0){
        callback(null);
      }
    }

    function makeDir(dirPath) {
      if (!dirPath) {
        return;
      }

      Fs.mkdir(dirPath, 0755, function (err) {
          if (err) {
            /* 17 = error code for: File exists!*/
            if (err.errno === 17) {
              console.log(Style.cyan('Project with name: ') + Style.magenta('"' + projectName + '"') + Style.cyan(' already exists!'));
              process.exit(1);
            } else {
              throw err;
            }
          }
          folderCount -= 1;
          makeDir(outPut.shift());
          callbackIfDone(null);
        });
    }

    makeDir(projectPath);
  };

  /**
   * Helper to generate and place the build tools: 'm-build' and 'm-server'
   * inside the new projects 'app' folder.
   * @param callback, calling the next helper.
   */
  var generateBuildTools = function generateBuildTools(callback) {
    var templateFile = tools.shift();
    var outputPath = path + projectName + '/' + templateFile;
    var ctx = {
      espresso: espressoPath,
      appName: projectName
    };

    templateRenderer.render({
        templateFile: templateFile,
        ctx: ctx,
        outputPath: outputPath,
        callback: callback
      });
  };

  /**
   * Helper to generate the 'main.js' for the new project.
   * @param callback, calling the next helper.
   */
  var generateMainJS = function generateMainJS(callback) {
    var templateFile = 'main.js';
    var outputPath = path + projectName + '/app/main.js';

    if (isHelloWorldProject) {
      templateFile = 'hello_world_main.js';
    }

    var ctx = {
      appName: projectName,
      e_Version: ''
    };

    templateRenderer.render({
        templateFile: templateFile,
        ctx: ctx,
        outputPath: outputPath,
        callback: callback
      });
  };

  /**
   * Helper to 'copy' the Mproject the new crated project.
   * @param callback, calling the next helper.
   */
  var browseProjectFiles = function browseProjectFiles(callback) {
    var folderCount = 0;
    var mProjectPath =  espressoPath + '/frameworks/The-M-Project';
    var mProjectFiles = [];

    function callbackIfDone() {
      if (folderCount === 0) {
        callback(null, mProjectFiles);
      }
    }

    function browse(path) {
      Sequencer(
        function () {
          Fs.stat(path, this);
        },

        function (err, stats) {
          if (err) {
            throw err;
          }

          if (stats.isDirectory()) {
            Fs.readdir(path, this);
          } else {
            mProjectFiles.push(new File({ name: path, path: path }));
            folderCount -= 1;
            callbackIfDone();
          }
        },

        function (err, subPaths) {
          if (err) {
            throw err;
          } 

          subPaths.forEach(function (subpath) {
              /* add 1 to the counter if sub file is NOT a folder*/
              if (subpath.match('\\.')) {
                folderCount += 1;
              }
              browse(Path.join(path, subpath));
            });
        }
      );
    }

    browse(mProjectPath);
  };

  var copyProject = function copyProject(files, callback) {
    var currentFile = files.shift();

    if (currentFile) {
      var fileTarget = currentFile.path.split('frameworks/')[1];
      fileTarget = fileTarget.split(currentFile.getBaseName() + currentFile.getFileExtension())[0];
      var streamPath = path + projectName + '/frameworks/' + fileTarget + 
        currentFile.getBaseName() + currentFile.getFileExtension();

      var writeStream = Fs.createWriteStream(streamPath);

      Util.pump(Fs.createReadStream(currentFile.path), writeStream, function (err) {
          if (err) {
            throw err;
          }
          copyProject(files);
        });
    }
  };

  /*
   * Build sequence
   */

  Sequencer(
    function () {
      makeProjectDir(this);
    },

    function (err, framework) {
      if (err) {
        throw err;
      }
      generateBuildTools(this);
    },

    function (err) {
      if (err) {
        throw err;
      }
      generateMainJS(this);
    },

    function (err) {
      if (err) {
        throw err;
      }
      browseProjectFiles(this);
    },

    function (err, framework) {
      if (err) {
        throw err;
      }
      copyProject(framework, this);
    },

    function (err) {
      if (err) {
        throw err;
      }
      Util.puts('Project successfully generated!');
    }
  );
};
