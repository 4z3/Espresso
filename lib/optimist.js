/*
Copyright 2010 James Halliday (mail@substack.net)

This project is free software released under the MIT/X11 license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

module.exports = Argv;
var path = require('path');

// Hack to work when loaded with CoffeeScript
if (process.argv.length < 2 || process.argv[0] != 'node') {
    process.argv = ['coffee', ''].concat(process.argv);
}

/*  Hack an instance of Argv with process.argv into Argv
    so people an do
        require('optimist')(['--beeble=1','-z','zizzle']).argv
    to parse a list of args and
        require('optimist').argv
    to get a parsed version of process.argv.
*/
var inst = Argv(process.argv.slice(2));
Object.keys(inst).forEach(function (key) {
    Argv[key] = typeof inst[key] == 'function'
        ? inst[key].bind(inst)
        : inst[key];
});

function Argv (args, cwd) {
    var self = {};
    if (!cwd) cwd = process.cwd();

    self.$0 = process.argv
        .slice(0,2)
        .map(function (x) {
            var b = rebase(cwd, x);
            return x.match(/^\//) && b.length < x.length
                ? b : x
        })
        .join(' ')
    ;

    if (process.argv[1] == process.env._) {
        self.$0 = process.env._.replace(
            path.dirname(process.execPath) + '/', ''
        );
    }

    self.argv = { _ : [], $0 : self.$0 };

    function set (key, value) {
        if (key in self.argv) {
            if (!Array.isArray(self.argv[key])) {
                self.argv[key] = [ self.argv[key] ];
            }
            self.argv[key].push(value);
        }
        else {
            self.argv[key] = value;
        }
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];

        if (arg == '--') {
            self.argv._.push.apply(self.argv._, args.slice(i + 1));
            break;
        }
        else if (arg.match(/^--.+=/)) {
            var m = arg.match(/^--([^=]+)=(.*)/);
            set(m[1], m[2]);
        }
        else if (arg.match(/^--no-.+/)) {
            var key = arg.match(/^--no-(.+)/)[1];
            set(key, false);
        }
        else if (arg.match(/^--.+/)) {
            var key = arg.match(/^--(.+)/)[1];
            var next = args[i + 1];
            if (next !== undefined && !next.match(/^-/)) {
                set(key, next);
                i++;
            }
            else {
                set(key, true);
            }
        }
        else if (arg.match(/^-[^-]+/)) {
            arg.slice(1,-1).split('').forEach(function (letter) {
                set(letter, true);
            });

            var key = arg.slice(-1)[0];

            if (args[i+1] && !args[i+1].match(/^-/)) {
                set(key, args[i+1]);
                i++;
            }
            else {
                set(key, true);
            }
        }
        else {
            self.argv._.push(arg);
        }
    }

    var usage;
    self.usage = function (msg) {
        usage = msg;
        return self;
    };

    function fail (msg) {
        if (usage) console.error(usage.replace(/\$0/g, self.$0))
        console.error(msg);
        process.exit();
    }

    self.check = function (f) {
        try {
            if (f(self.argv) === false) fail(
                'Argument check failed: ' + f.toString()
            );
        }
        catch (err) { fail(err) }

        return self;
    };

    self.demand = function (keys, cb) {
        if (typeof keys == 'number') {
            return self.demandCount(keys, cb);
        }

        var missing = [];
        keys.forEach(function (key) {
            if (!(key in self.argv)) missing.push(key);
        });

        if (missing.length > 0) {
            if (cb) cb(missing);
            else fail('Missing arguments: ' + missing.join(' '));
        }
        return self;
    };

    self.demandCount = function (count, cb) {
        if (self.argv._.length < count) {
            if (cb) cb(self.argv._.length);
            else fail('Not enough arguments, expected '
                + count + ', but only found ' + self.argv._.length);
        }
        return self;
    };

    self.defaults = function (key, value) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(function (k) {
                self.defaults(k, key[k]);
            });
        }
        else {
            if (self.argv[key] === undefined) {
                self.argv[key] = value;
            }
        }
        return self;
    };

    self.parse = function (args) {
        return Argv(args).argv;
    };

    return self;
};

// rebase an absolute path to a relative one with respect to a base directory
// exported for tests
module.exports.rebase = rebase;
function rebase (base, dir) {
    var ds = path.normalize(dir).split('/').slice(1);
    var bs = path.normalize(base).split('/').slice(1);

    for (var i = 0; ds[i] && ds[i] == bs[i]; i++);
    ds.splice(0, i); bs.splice(0, i);

    var p = path.normalize(
        bs.map(function () { return '..' }).concat(ds).join('/')
    ).replace(/\/$/,'').replace(/^$/, '.');
    return p.match(/^[.\/]/) ? p : './' + p;
}
