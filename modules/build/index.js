
// module: build

exports.subcommand = {
  description: 'Build a project.',
  parameters: [
    {
      options: ['-d','--directory'],
      description:
        'Specify a custom project directory. Default: ' + process.cwd(),
      handler: 'config',
      config: 'applicationdirectory'
    }
  ]
};

exports.deps = [
  'config',
  'The-M-Project',
  'index.html',
  'save-local',
  'eliminate',
  'app',
  'files',
  'scripts',
  'sort-by-m_require',
  'sort-by-framework',
  'merge-by-framework'
];

exports.duty = function (callback) {
  callback();
};
