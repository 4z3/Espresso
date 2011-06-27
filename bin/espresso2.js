#! /usr/bin/env node

var Scheduler = require('../lib/scheduler');

Scheduler.schedule('espresso').run(function (finish) {
  return finish();
});
