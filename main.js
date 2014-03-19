requirejs.config({
    paths: {
        async : "bower_components/requirejs-plugins/src/async",
        propertyParser : "bower_components/requirejs-plugins/src/propertyParser",
        goog : "bower_components/requirejs-plugins/src/goog",
        jquery : "bower_components/jquery/dist/jquery",
        angular : "bower_components/angular/angular",
        bootstrap : "bower_components/bootstrap/dist/js/bootstrap",
        bootstrapUI : "bower_components/angular-bootstrap/ui-bootstrap",
        codemirror : "bower_components/codemirror/lib/codemirror",
        codemirrorSparql : "bower_components/codemirror/mode/sparql/sparql",
        codemirrorUI : "bower_components/angular-ui-codemirror/ui-codemirror",
        codemirrorHint : "bower_components/codemirror/addon/hint/show-hint",
        _squebi : "squebi/js/squebi",
        squebiBrowse : "squebi/js/writer/squebi.browse",
        squebiJson : "squebi/js/writer/squebi.json",
        squebiXml : "squebi/js/writer/squebi.xml",
        squebiPie: "squebi-writer/piechart/squebi.pie"
    },
    shim: {
        'goog': ['async','propertyParser'],
        'angular' : ['jquery'],
        'bootstrap' : ['jquery'],
        'bootstrapUI' : ['angular','bootstrap'],
        'codemirrorSparql' : ['codemirror'],
        'codemirrorUI' : ['codemirror','bootstrapUI'],
        'codemirrorHint' : ['codemirror'],
        '_squebi' : ['codemirrorHint','codemirrorUI','codemirrorSparql','bootstrapUI'],
        'squebiBrowse' : ['_squebi'],
        'squebiJson' : ['_squebi'],
        'squebiXml' : ['_squebi'],
        'squebiPie' : ['_squebi']
    },map: {
        '*': {
            'css': 'bower_components/require-css/css'
        }
    }
});

require([
    "css",
    "squebiBrowse",
    "squebiJson",
    "squebiXml",
    'goog!visualization,1,packages:[corechart]',
    "squebiPie",
    "css!squebi/css/flags",
    "css!bower_components/bootstrap/dist/css/bootstrap",
    "css!bower_components/codemirror/lib/codemirror",
    "css!bower_components/codemirror/theme/neat",
    "css!bower_components/codemirror/addon/hint/show-hint",
    "css!bower_components/fontawesome/css/font-awesome",
    "css!squebi/css/style"
], function() {
    angular.element(document).ready(function($http,$rootScope) {
        $http.get("squebi/config.json",function(data) {
            $http.get("config.json",function(data2) {
                jQuery.extend(data,data2);
            }).always(function(){
                    jQuery('body').show();
                    squeby.constant('SQUEBY',data);
                    angular.bootstrap(document, ['Squeby']);
            });
        });
    });
});