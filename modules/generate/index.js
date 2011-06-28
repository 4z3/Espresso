
// module: generate

exports.subcommand = {
  description: 'Generate new or addidional files for a project.',
  options: [
    {
      options: [ '-i', '--i18n' ],
      description: 'Create new i18n files.',
      handler: 'config',
      config: 'generateI18N'
    },
    {
      options: [ '-t', '--target' ],
      description: 'Create new "targets.json" sample files.',
      handler: 'config/Array.prototype.push',
      config: 'generateTargets'
    }
  ],
  parameters: [
    {
      options: ['-d','--directory'],
      description:
        'Specify a custom project directory. Default: ' + process.cwd(),
      handler: 'config',
      config: 'applicationDirectory'
    },
    {
      options: ['-m','--model'],
      description: 'Create a new model.',
      handler: 'config/Array.prototype.push',
      config: 'generateModels'
    },
    {
      options: ['-c','--controller'],
      description: 'Create a new controller.',
      handler: 'config/Array.prototype.push',
      config: 'generateControllers'
    },
    {
      options: ['-v','--view'],
      description: 'Create a new view.',
      handler: 'config/Array.prototype.push',
      config: 'generateViews'
    },
    {
      options: ['-x','--validator'],
      description: 'Create a new validator.',
      handler: 'config/Array.prototype.push',
      config: 'generateValidators'
    },
  ]
};

exports.deps = [ 'config' ];

exports.duty = function (callback) {
  var config = this.config;

  //
  // format options for the generator
  //
  var options = {
    directory: config.applicationDirectory,
  };

  var something_set = false;
  var something_went_wrong = false;

  function _set_option(from, to) {
    if (from in config) {
      if (config[from] instanceof Array) {
        if (config[from].length !== 1) {
          console.error(
            'Error: You cannot specify more than one ' + to + '!');
          //throw new Error('You are made of stupid!');
          something_went_wrong = true;
        } else {
          options[to] = config[from][0];
          something_set = true;
        };
      } else {
        // TODO check harder?
        config[from] = to;
        something_set = true;
      };
    };
  };

  _set_option('generateModels', 'model');
  _set_option('generateControllers', 'controller');
  _set_option('generateViews', 'view');
  _set_option('generateValidators', 'validator');
  _set_option('generateI18N', 'i18n');
  _set_option('generateTargets', 'target');

  if (!something_went_wrong) {
    if (!something_set) {
      console.error('No generation was specified!');
    } else {
      // call the generator
      console.log('options', options);
      var Generator = require(__dirname + '/../../generator/file_generator');
      Generator.generate(options);
    };
  };

  callback();
};
