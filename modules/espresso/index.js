
// module: espresso

exports.deps = [
  'config'
];

exports.duty = function (callback) {
  console.log('espresso, config:', this.config);
  if (this.config.agenda) {
    var Scheduler = require('../../lib/scheduler');

    var results = {};
    var that = this;
    exports.deps.forEach(function (name) {
      results[name] = that[name];
    });

    Scheduler.schedule(this.config.agenda).run(callback, results);
  } else {
    console.log('no agenda');
    callback();
  };
};
