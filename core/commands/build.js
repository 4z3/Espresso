/*!
 * command module for building a project
 *
 * Copyright(c) 2011 M-Way Solutions GmbH. All rights reserved.
 * MIT and GPL Licensed
 *
 * @author pfleidi
 */


// TODO: Add switch for JSLint
// TODO: Add switch for minifier

exports.description = 'Command to build a project';

exports.examples = [
  '--directory myProject'
];

exports.options = {

  config: {
    'description': 'Specify a custom config',
    'hasargument': true
  },

  directory: {
    'description': 'Specify a custom project directory',
    'default': '$PWD',
    'hasargument': true
  }

};

exports.run = function run(params) {
  var App = require('../app').App;
  var app = new App(params);
  app.loadTheApplication();
  app.loadTheMProject();

  app.build(function (options) {
      app.saveLocal(function () {
        var Conductor = new require('../../lib/conductor');
        var conductor = new Conductor(app);
        var filter = app.filter instanceof Array ? app.filter : [];

        // add defaults 
        if (app.offlineManifest) {
          if (filter.indexOf('manifest') < 0) {
            filter.push('manifest');
          };
        };

        // TODO get buildDir from some authoritative place
        var path = [
          app.applicationDirectory, app.outputFolder, app.buildVersion
        ].join('/');

        (function run (i) {
          if (i < filter.length) {
            var name = filter[i];
            return conductor.run(name, path, function () {
              return run(i + 1);
            });
          };
        })(0);
      });
    });
};
