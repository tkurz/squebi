if(window.SQUEBI == undefined) SQUEBI = {};

SQUEBI.app = SQUEBI.app || ".";
SQUEBI.container = SQUEBI.container || "body";

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
        _squebi : SQUEBI.app + "/squebi/js/squebi",
        squebiBrowse : SQUEBI.app + "/squebi/js/writer/squebi.browse",
        squebiJson : SQUEBI.app + "/squebi/js/writer/squebi.json",
        squebiXml : SQUEBI.app + "/squebi/js/writer/squebi.xml",
        squebiPie: SQUEBI.app + "/squebi/js/writer/squebi.pie"
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
    "css!" + SQUEBI.app + "/squebi/css/flags",
    "css!bower_components/bootstrap/dist/css/bootstrap",
    "css!bower_components/codemirror/lib/codemirror",
    "css!bower_components/codemirror/theme/neat",
    "css!bower_components/codemirror/addon/hint/show-hint",
    "css!bower_components/fontawesome/css/font-awesome",
    "css!" + SQUEBI.app + "/squebi/css/style"
], function() {

    angular.element(document).ready(function($http,$rootScope) {

        var defaultConfig = {
            "selectService": "http://example.org/sparql/select",
            "updateService": "http://example.org/sparql/update",
            "samples": [
                {"name":"Select first 10 triples", "value":"SELECT * WHERE {\n  ?subject ?property ?object\n} LIMIT 10","type":"browse"},
                {"name":"List types", "value":"SELECT DISTINCT ?type WHERE {\n  [] a ?type\n} ORDER BY ?type","type":"browse"},
                {"name":"List properties", "value":"SELECT DISTINCT ?property WHERE {\n  [] ?property []\n} ORDER BY ?property","type":"browse"},
                {"name":"List classes and count their usage as pie chart", "value":"SELECT ?class (COUNT (?s) AS ?count) WHERE {\n  ?s a ?class\n}\nGROUP BY ?class\nORDER BY DESC(?count)","type":"piechart"}
            ],
            "hints": [
                {"container":"samples","content":"<img width='300px' src='" + SQUEBI.app + "/squebi/img/hint1.png'>","position":2,"dimension":{"width":100,"height":100},"css":"margin-top:-5px;margin-left:-10px"},
                {"container":"query-container","content":"<img width='300px' src='" + SQUEBI.app + "/squebi/img/hint3.png'>","dimension":{"width":100,"height":100},"css":"margin-top:120px;margin-left:-210px"},
                {"container":"writers","content":"<img width='370px' src='" + SQUEBI.app + "/squebi/img/hint2.png'>","dimension":{"width":100,"height":100},"css":"margin-top:-30px;margin-left:-400px","position":2}
            ],
            "namespaces": {
                "http://www.w3.org/2000/01/rdf-schema#":"rdfs",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#":"rdf",
                "http://www.w3.org/2004/02/skos/core#":"skos",
                "http://xmlns.com/foaf/0.1/":"foaf",
                "http://purl.org/dc/terms/":"dct",
                "http://www.w3.org/ns/ma-ont#":"ma",
                "http://purl.org/dc/elements/1.1/":"dc"
            },
            "updateAllowed": true
        }

        jQuery.extend(defaultConfig, SQUEBI);
        jQuery('body').show();
        squebi.constant('SQUEBI', defaultConfig);
        angular.bootstrap(SQUEBI.container, ['Squebi']);

    });
});