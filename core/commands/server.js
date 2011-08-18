/*!
 * command module for development server
 * @autor pfleidi
 */


exports.description = 'Command to run the Development server';

exports.name = 'server';

exports.examples = [
  '--port 8080 --manifest',
  '-m --p 2342 --config config.json'
];

exports.options = {

  manifest: {
    'description': 'Start the server in manifest mode. Enable generation of cache.manifest',
    'default': false
  },

  config: {
    'description': 'Specify a custom config',
    'hasargument': true
  },

  directory: {
    'description': 'Specify a custom project directory',
    'default': '$PWD',
    'hasargument': true
  },

  port: {
    'description': 'Specify a custom port',
    'default': 8000,
    'hasargument': true
  }

};

exports.run = function run(params) {
  var fs = require('fs');
  var App = require('../app').App;
  var app = new App(params);
  //var Server = require('../server').Server;
  //var server = new Server(params);

  //server.run();

  // TODO get buildDir from some authoritative place
  var output_dir = [
    app.applicationDirectory, app.outputFolder, app.buildVersion
  ].join('/');

  fs.mkdirSync(output_dir, 00755);

  var app_json = output_dir + '/app.json';
  var config_json = output_dir + '/config.json';

  var minapp = {
    files: {},
    proxies: {}
  };

  minapp.files['/' + app.name + '/index.html'] = {
    signal: 'SIGSTOP'
  };

  // TODO make

  fs.writeFileSync(app_json, JSON.stringify(minapp, null, 2));

  // generate config.json for espresso build
  // i.e. ensure we have the required filters ("manifest", "app.json",
  // "SIGCONT", "abolish") and the app.json
  //(function () {
  //  var config = JSON.parse(fs.readFileSync(app.applicationConfig));

  //  // ensure we have all required filters (TODO in a particular order)
  //  if (!config.hasOwnProperty('filter')) {
  //    config.filter = [];
  //  };
  //  //[ 'manifest'
  //  //, 'app.json'
  //  //, 'SIGCONT'
  //  //, 'abolish'
  //  //].forEach(function (key) {
  //  //  if (config.filter.indexOf(key) < 0)
  //  //    config.filter.push(key);
  //  //});
  //  //config['app.json'] = {
  //  //  filename: app_json
  //  //};

  //  fs.writeFileSync(config_json, JSON.stringify(config, null, 2));
  //})();

  var config = {
    output_dir: output_dir,
    app_json: app_json,
    app_name: app.name,
    //config_json: config_json,
    config_json: app.applicationConfig,
    port: params.port,
    handler: 'aurora',
    deserver_script: process.env.HOME + '/sandbox/deserver'
  };

  var start_url = 
    'http://localhost:' + config.port + '/' + config.app_name + '/index.html';

  console.log(start_url);
  var server = require('../../components/deserver')(null, config, params);
  return server(null, function () {
    console.log('server done:', Array.prototype.slice.call(arguments));
  });
};
