// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: �2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   alexander
// Date:      29.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================



var Task_ContentType,
    Task = require('./Task').Task;


Task_ContentType = exports.Task_ContentType = function() {

  /* Properties */
  this.name = 'content type';
  this.contentTypes = {
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".json": "application/json",
    ".svg": "image/svg+xml"
  };
     


};

/**
 * Get the run() function from Task
 * @param framework
 */
Task_ContentType.prototype = new Task;


Task_ContentType.prototype.duty = function(framework,callback){
var self = this;

  framework.files.forEach(function(_currentFile){
          _currentFile.contentType = (self.contentTypes[_currentFile.getFileExtension()]) ? self.contentTypes[_currentFile.getFileExtension()] :  'text/plain';

       if(_currentFile.isStylesheet()){
          _currentFile.requestPath = '/'+'theme/'+_currentFile.getBaseName()+_currentFile.getFileExtension();
          _currentFile.contentType = "text/css; charset=utf-8";
       }else if(_currentFile.isImage()){
          _currentFile.requestPath = '/'+'theme/images/'+_currentFile.getBaseName()+_currentFile.getFileExtension();
       }else if (_currentFile.isHTML()){
          _currentFile.requestPath = '/'+framework.app.name;
       }else{
          _currentFile.requestPath = '/'+_currentFile.getBaseName()+_currentFile.getFileExtension();
       }
  });


  callback();


};