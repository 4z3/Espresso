
// module: command-line

exports.deps = [
  'modules'
];

exports.duty = function (callback) {
  var Operetta = require('../../node_modules/operetta/operetta').Operetta;
  var operetta = new Operetta();

  var modules = this.modules;
  var config = {};

  //
  // setup subcommands
  //
  // Every module that exports a subcommand property is accessible through
  // the command line interface using Operetta's subcommand facility.
  Object.keys(modules)
    .map(function (name) { return modules[name] })
    .filter(function (module) { return 'subcommand' in module })
    .forEach(function (module) {
      var sub = module.subcommand;
      console.log('subcommand:', module.name);
      operetta.command(module.name, sub.description, function (command) {

        // Don't print usage when there are no further arguments.
        // This hack fools Operetta to treat subcommand like normal commands.
        command.parent = false;

        function handle_parameter(par, value) {
          switch (typeof par.handler) {
            case 'string':
              switch(par.handler) {
                case 'config/Array.prototype.push':
                  if (!(par.config in config)) {
                    config[par.config] = [];
                  };
                  if (!(config[par.config] instanceof Array)) {
                    console.error('Error:', par.config, 'is not and array');
                    throw new Error('You are made of stupid!');
                  } else {
                    config[par.config].push(value);
                    console.log(
                      'config[' + JSON.stringify(par.config) + ']'
                      + '.push(' + JSON.stringify(value) + ')');
                  };
                  break;
                case 'config':
                  config[par.config] = value;
                  console.log(
                    'config[' + JSON.stringify(par.config) + ']'
                    + ' = ' + JSON.stringify(value));
                  break;
              };
              break;
          };
        };

        // setup subcommand parameters
        if (sub.parameters instanceof Array) {
          sub.parameters.forEach(function (par) {
            command.parameters(par.options, par.description, function (value) {
              handle_parameter(par, value);
            });
          });
        };

        // setup subcommand options
        if (sub.options instanceof Array) {
          sub.options.forEach(function (par) {
            command.options(par.options, par.description, function (value) {
              handle_parameter(par, value);
            });
          });
        };

        command.banner = 'Usage: espresso ' + module.name + ' [<options>]';

        trap_help(config, command);
        command.start(function (values) {
          // TODO what to do with values?
          if (!('agenda' in config)) {
            // Set default subcommand agenda.
            config.agenda = [ module.name ];
          };
        });
      });
    });

  operetta.banner = 'Usage: espresso <command> [<options>]';

  trap_help(config, operetta);
  operetta.start(function (values) {
    if (!('agenda' in config)) {
      [ '// Your process.argv[32m'
      , process.argv
      , '[m// interpreted as[32m'
      , values
      , '[m// is invalid!'
      , ''
      ].forEach(function (x) { console.log(x) });

      // Set default agenda (if no subcommand has set the agenda).
      mangle_help_message(operetta);
      force_help(config, operetta);
    };
    callback(config);
  });

};

// Turn Operetta's --help handler into a command line agenda.
function trap_help (config, command) {
  command.options(['-h', '--help'], 'Show help', function () {
    mangle_help_message(command);
    force_help(config, command);
  });
};

// 
function force_help (config, command) {
  config.agenda = [ 'print-usage' ];
  config.usage = function () {
    command.usage();
  };
};

// Reformat help message to match the style of old Espresso.
function mangle_help_message (command) {
  var match = /(<[^>]+>)/.exec(command.banner);
  var replacement = {
    '<options>': 'Where <options> is any combination of',
    '<command>': 'Where <command> is one of'
  };
  command.help = command.help
    .replace(/^/gm, '   ')
    .replace(/^\s+Usage:$/m, replacement[match[1]]);
};
