
// module: espresso

exports.deps = [
  'config'
];

exports.duty = function (callback) {
  console.log('espresso, config:', this.config);
  if (this.config.agenda) {
    var Scheduler = require('../../lib/scheduler');
    //console.log('self.scheduler:', this.self.scheduler);
    Scheduler.schedule(this.config.agenda).run(callback,
        this.self.scheduler.results);
  } else {
    console.log('no agenda');
    callback();
  };
};
