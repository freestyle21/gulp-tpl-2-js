var glob = require("glob");
var path = require('path');
var Q = require('q');
var handlebars = require('handlebars');
var mkdirp = require('mkdirp');

var fs = require('fs');
var colors = require('colors');

var REQUIRSE_REG = /require\(([^)]+)\)/g;
var WORD_FROM_QUOTE = /\(\'(.*)\'\)|\(\"(.*)\"\)/;
var DEFINE_REG = /(define\()(function\(require,[\s]*exports(,[\s]*module)?\)[\s]*\{)/;

var process = {
    start: function(filename, data) {
        var deferred = Q.defer();
        try {
            this.compileTpl(filename, data);
            deferred.resolve();
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    },
    compileTpl: function(fileName, data) {
        var result;
        if(fileName.indexOf('.tpl') == -1) {
            return false;
        }
        result = handlebars.precompile(data);
        result = "define(function(require, exports, module){var Handlebars = require('handlebars'), template = Handlebars.template; \n module.exports = template(" + result + ")});";

        var dir = path.dirname(fileName);
        var file = path.basename(fileName);
        var ps = dir + '/compiled/'+ file + '.js';

        this.writeFile(ps, result, 'utf-8');
    },
    writeFile: function(ps, data) {
        mkdirp(path.dirname(ps), function (err) {
           if (err) {
                // console.log("ERROR !! " +err.red);
           }
           ps = ps.replace('.tpl', '-tpl');
           fs.writeFile(ps, data,function() {
                // console.log(ps.magenta + ' written success'.magenta);
           });
        });
    },
    changeViewQuote: function(fileName, data) {

        // 只处理文件名不含有 compiled 的 .js文件
        if(fileName.indexOf('.js') == -1) {
            return false;
        }
        if(fileName.indexOf('compiled') != -1) {
            return false;
        }
        this.changeFileToCompiled(fileName, data);
        this.changeFileToNormal(fileName, data);
    },
    changeFileToCompiled: function(fileName, data) {
        var reg = /require\([\'\"]([^\'^\"]*\.tpl)[\'\"]\)/g;
        if(!data.match(reg)) {
            return null;
        }
        var success = false;

        var result = data.replace(reg, function(fullMatch, fullPath){
            var fileArr = fullPath.split('/');
            var fileExt = fileArr[fileArr.length -1 ];
            var ta;
            if(fullPath.indexOf('compiled/') == -1) {
               fullMatch = fullMatch.replace('script', 'dist');
               ta =  fullMatch.replace(fileExt, 'compiled/'+ fileExt.replace('.tpl', '-tpl') + '.js');
            }

            if(!ta ) {
                // console.log(fileName);
            }
            ta = ta.replace(/\"/g,"'")
            // console.log('Compiled ' + ta + ' done.');
            success = true;
            return ta;
        });
        if(success) {
            fs.writeFile(fileName,  result, 'utf8', function (err) {
                if (err) return {
                    // console.log(err);
                }
            });
        }
    },
    changeFileToNormal: function(fileName, data) {
        var reg = /require\([\'\"]([^\'^\"]*-tpl.js)[\'\"]\)/g;

        if(!data.match(reg)) {
            return null;
        }

        var result = data.replace(reg, function(fullMatch, fullPath){
            var fileArr = fullPath.split('/');
            var fileExt = fileArr[fileArr.length -1 ];
            var ta;

            if(fullPath.indexOf('compiled/') != -1) {
                ta =  fullMatch.replace('compiled/', '').replace('dist', 'script');
                ta =  ta.replace('.js', '');
                ta = ta.replace('-tpl', '.tpl');
            }
            if(!ta ) console.log(fileName);
            ta = ta.replace(/\"/g,"'");
            // console.log( 'Raw ' + ta + ' done.');
            return ta;
        });

        // fileName = fileName.replace('dist', 'script');
        fs.writeFile(fileName,  result, 'utf8', function (err) {
            if (err) return {
             // console.log(err);
            }
        });
    }
};

module.exports = function(options, file, enc, cb, context) {
    if (file.isNull()) {
        context.push(file);
        return cb();
    }

    if (file.isStream()) {
        context.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        return cb();
    }

    context.push(file);

    process.start(file.path, file.contents.toString()).then(function() {
        process.changeViewQuote(file.path, file.contents.toString());
    }, function() {
        // console.log('change tpl error!'.red);
    });

    cb();
}
