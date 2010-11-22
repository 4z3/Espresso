// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: �2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   alexander
// Date:      19.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================


var _l = {},
    Task_MakeOutputDir,
    Step = require('../lib/step'),
    Task = require('./Task').Task;

/*
 * The required modules.
 */
_l.sys = require('sys');
_l.fs = require('fs');



Task_MakeOutputDir = exports.Task_MakeOutputDir = function() {

  /* Properties */
  this.name = 'make output dir';

};

/**
 * Get the run() function from Task
 * @param framework
 */
Task_MakeOutputDir.prototype = new Task;

/**
 * Combining all the files, contained in the result of merging process
 * @param framework the reference to the framework this task is working with.
 */
Task_MakeOutputDir.prototype.duty = function(framework,callback){
var self = this;
var _outputPath = framework.app.execPath+'/'+framework.app.outputFolder;
   self.outP = [];
   self.outP.push(_outputPath);
   self.outP.push('/'+framework.app.buildVersion);
   self.outP.push('/theme');
   self.outP.push('/images');
_l.sys.puts('Running Task: "make output dir"');


 var _OutputDirMaker = function(framework, callback) {
    var that = this;


    that._resourceCounter = 4; /*make 2 folders*/

    that.callbackIfDone = function() {
      if (that._resourceCounter === 0){
          callback(framework);
      }
    };

    that.exitNow = function() {
          callback(framework);
    };

    that.makeOutputDir = function(path) {

      if(that._resourceCounter >=1){
      _l.fs.mkdir(path, 0777 ,function(err){
           that._resourceCounter--;
           that.makeOutputDir(path+ self.outP.shift());


      });
      }
      that.callbackIfDone();

    }

  };
  

 new _OutputDirMaker(framework, callback).makeOutputDir(self.outP.shift());


};