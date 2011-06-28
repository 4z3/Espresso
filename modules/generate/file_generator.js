// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2011 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   alexander
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================


/*
 * dependencies
 */
var mkdir = require('fs').mkdir;
var renderFile = require('mustache.js').renderFile;

var generate = exports.generate = function generate(options, config) {
  var espressoPath = __dirname + '/../..';
  var templatePath = espressoPath + '/generator/templates';   
  var dispatcher = {};

  /**
   * Generate new file of specific type
   *
   * @param {String} type
   * @param {String} name
   * @return {undefined}
   * @api private
   */
  function genericGenerate(type, templateFile, name) {
    templateFile = templatePath + '/' + templateFile;
    var directory = options.directory + '/app/' + type + '/';
    var outputPath = directory + name + '.js';
    var callback = function callback(err) {
      if (err) {
        console.error('Error:', err.message);
      }
    };

    var ctx = {
      name: name,
      appName: config.name
    };

    mkdir(directory, 0755, function (err) {
        if (err) {
          // errno 17: folder already exists
          if (err.errno !== 17) {
            throw err;
          }
        }

        renderFile(outputPath, templateFile, ctx, callback);
        });
  }

  /**
   * Generate new target file
   *
   * @param {String} outputPath
   * @param {Function} callback
   * @return {undefined}
   * @api private
   */
  dispatcher.generateTarget = function generateTarget() {
    var templateFile = templatePath + '/targets.json';
    var callback = function callback(err) {
      if (err) {
        console.error('Error:', err.message);
      }
    };

    var ctx = {
      appName: config.name
    };

    var outputPath = options.directory + '/targets.json';

    renderFile(outputPath, templateFile, ctx, callback);
  };

  /**
   * Generate new model file
   *
   * @param {String} modelName 
   * @return {undefined}
   * @api private
   */
  dispatcher.generateModel = function generateModel(modelName) {
    genericGenerate('models', 'model.js', modelName);
  };

  /**
   * Generate new view file
   *
   * @param {String} viewName 
   * @return {undefined}
   * @api private
   */
  dispatcher.generateView = function generateView(viewName) {
    genericGenerate('views', 'view.js', viewName);
  };

  /**
   * Generate new controller file
   *
   * @param {String} controllerName 
   * @return {undefined}
   * @api private
   */
  dispatcher.generateController = function generateController(controllerName) {
    genericGenerate('controllers', 'controller.js', controllerName);
  };

  /**
   * Generate new validator file
   *
   * @param {String} validatorName 
   * @return {undefined}
   * @api private
   */
  dispatcher.generateValidator = function generateValidator(validatorName) {
    genericGenerate('validators', 'validator.js', validatorName);
  };

  /**
   * Generate new i18n file
   *
   * @param {String} i18nName
   * @return {undefined}
   * @api private
   */
  dispatcher.generateI18n = function generateI18n() {
    genericGenerate('resources/i18n', 'i18n_de_de.js', 'i18n_de_de');
    genericGenerate('resources/i18n', 'i18n_en_us.js', 'i18n_en_us');
  };

  (function dispatchOperations() {
      Object.keys(options).forEach(function (operation) {
          if (operation !== 'directory' && operation !== 'help') {
            var opName = operation.charAt(0).toUpperCase() + operation.substring(1);
            dispatcher['generate' + opName](options[operation]);
          }
        });
    }());

};