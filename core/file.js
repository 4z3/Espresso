// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: �2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   alexander
// Date:      03.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

/**
 * The file prototype.
 *
 */

var _l = {},
    File;

_l.fs = require('fs');
_l.path = require('path');
_l.sys = require('sys');

/**
 * @description
 * The constructor of the file prototype.
 * @constructor
 * @param properties
 */
File = exports.File = function(properties) {
 
   /* Properties */
  this.virtual = false;  
  this.path = '';
  this.framework = '';
  this.children = '';
  this.isHtml = false;
  this.content =  {}; // buffer object, to hold the content of a file.
  this.contentType = '';
  this.requestPath ='';

  this.url = '';
  this.extname;
  this.basename;
  this.frDelimiter;
  this.name = '';
  this.dependencies = [];
  this.resourceExtensions = ['.png', '.jpg', '.gif', '.svg'];

  /* Adding the properties */
  if(properties){
     this.addProperties(properties);
  }
};


/**
 * @description
 * Add the properties for File.
 * @param properties
 */
File.prototype.addProperties = function(properties){

    var that = this;

    Object.keys(properties).forEach(function (key) {
         that[key] = properties[key];
    });

};

/**
 * @description
 * True if file is virtual.
 * A file is virtual, if it is generated during the build.
 * @example
 * index.html
 */
File.prototype.isVirtual = function(){
      return this.virtual
};

/**
 * @description
 * Getting the name of the File
 */
File.prototype.getName = function(){

      var filename =  this.name.split(this.frDelimiter);
      return filename[1];
};

/**
 * @description
 * Returns the name of the File without the file extension.
 */
File.prototype.getBaseName = function(){

  if (this.basename === undefined) {
    this.basename = _l.path.basename(this.path,_l.path.extname(this.path));
  }

  return this.basename;


};

/**
 * @description
 * Returns the file extension.
 */
File.prototype.getFileExtension = function() {

  if (this.extname === undefined) {
    this.extname = _l.path.extname(this.path);
  }

  return this.extname;
};

/**
 * @description
 * Returns 'true' if file is a stylesheet.
 */
File.prototype.isStylesheet = function() {
  return this.getFileExtension() === '.css';
};


/**
 * @description
 * True if file is a stylesheet.
 */
File.prototype.isHTML = function() {
  return this.getFileExtension() === '.html';
};

/**
 * @description
 * Returns 'true' if file is JavaScript.
 */
File.prototype.isJavaScript = function() {
  return this.getFileExtension() === '.js'; 
};

/**
 * @description
 * Returns 'true' if file is a Image.
 * Based on the possible resource extensions.
 * @example
 *  .png,
 *  .jpg,
 *  .gif,
 *  .svg
 */
File.prototype.isImage = function() {
var that = this;
    var x  = false;
    this.resourceExtensions.forEach(function (resExt) {
        if(resExt === that.getFileExtension()){
            x = true;
        }
    });
  return x;
};


/**
 * @description
 * Override Object.toString()
 * @exampleText
 * Basename: main.js
 * Filepath: /foo/bar/main.js
 * @return {string} a readable presentations of this file object.
 */
File.prototype.toString = function() {

    return 'Basename: '+this.name + '\n'
          +'Filepath: '+this.path + '\n';
};


