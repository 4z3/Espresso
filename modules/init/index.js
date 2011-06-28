
// module: init

exports.subcommand = {
  description: 'Generate a new project.',
  options: [
    {
      options: [ '-e', '--example' ],
      description: 'Generate a "Hello, world!" application.',
      handler: 'config',
      config: 'generateHelloWorld'
    }
  ],
  parameters: [
    {
      options: ['-p','--project'],
      description: 'Project name.',
      handler: 'config',
      config: 'name'
    },
    {
      options: ['-d','--directory'],
      description:
        'Specify a custom project directory. Default: ' + process.cwd(),
      handler: 'config',
      config: 'applicationDirectory'
    }
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
        options[to] = config[from];
        something_set = true;
      };
    };
  };

  _set_option('name', 'project');
  _set_option('generateHelloWorld', 'example');
  _set_option('applicationDirectory', 'directory');

  if (!something_went_wrong) {
    if (!something_set) {
      console.error('No generation was specified!');
    } else {
      // call the generator
      console.log('options', options);
      var Generator = require('./project_generator');
      Generator.generate(options);
    };
  };

  callback();
};

