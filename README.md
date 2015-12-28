## tpl-2-js

A tool which can pre-compile tpl to tpl.js & replace `require('xxx.tpl')` to `require('xxx.tpl.js')`

### Install

    npm install tpl-2-js -g

### Usage

    tpl-2-js -p <your file dir>

    tpl-2-js -p dist/

### Example

    +dist
     -a.js
     -a.tpl


    // a.js
    define(function(require, exports, module){
        var view = View.extend({
            template: require('a.tpl')
        });
    });
    // a.tpl
    <h1>I am b</h1>


` tpl-2-js -p dist`

    // a.js
    define(function(require, exports, module){
        var view = View.extend({
            template: require('compiled/a.tpl.js')
        });
    });

    // compiled/a.tpl.js
    define(function(require, exports, module){
        var Handlebars = require('handlebars'),
            template = Handlebars.template;

        template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
            return "<div class=\"entry\">\n    <div class=\"entry-logo\">\n        <img src=\"/images/entry_logo.png\">\n    </div>\n    <div class=\"entry-content\">\n        <div class=\"entry-content-item\">\n            <a href=\"javascript:void(0);\" data-role=\"express\" class=\"entry-link\">快车</a>\n        </div>\n        <div class=\"entry-content-item\">\n            <a href=\"javascript:void(0);\" data-role=\"daijia\" class=\"entry-link\">代驾</a>\n        </div>\n    </div>\n</div>\n";
        },"useData":true})
    });
