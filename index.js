var through = require('through2');
var tpl2js = require('./tpl-2-js');

module.exports = function (options) {
    return through.obj(function (file, enc, cb) {
        tpl2js(options, file, enc, cb, this);
    });
};
