#! /usr/bin/env node

var Scheduler = require('../lib/scheduler');

Scheduler.schedule(process.argv.slice(2)).run('espresso', function (finish) {
  return finish();
});
