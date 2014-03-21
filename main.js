if(window.SQUEBI == undefined) SQUEBI = {};

SQUEBI.app = SQUEBI.app || ".";
SQUEBI.bower = SQUEBI.bower || "bower_components";
SQUEBI.container = SQUEBI.container || "body";

requirejs.config({
    paths: {
        async : SQUEBI.bower + "/requirejs-plugins/src/async",
        propertyParser : SQUEBI.bower + "/requirejs-plugins/src/propertyParser",
        goog : SQUEBI.bower + "/requirejs-plugins/src/goog",
        jquery : SQUEBI.bower + "/jquery/dist/jquery",
        angular : SQUEBI.bower + "/angular/angular",
        bootstrap : SQUEBI.bower + "/bootstrap/dist/js/bootstrap",
        bootstrapUI : SQUEBI.bower + "/angular-bootstrap/ui-bootstrap",
        codemirror : SQUEBI.bower + "/codemirror/lib/codemirror",
        codemirrorSparql : SQUEBI.bower + "/codemirror/mode/sparql/sparql",
        codemirrorUI : SQUEBI.bower + "/angular-ui-codemirror/ui-codemirror",
        codemirrorHint : SQUEBI.bower + "/codemirror/addon/hint/show-hint",
        _squebi : "squebi/js/squebi",
        squebiBrowse : "squebi/js/writer/squebi.browse",
        squebiJson : "squebi/js/writer/squebi.json",
        squebiXml : "squebi/js/writer/squebi.xml",
        squebiPie: "squebi/js/writer/squebi.pie"
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
            'css': SQUEBI.bower + '/require-css/css'
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
    "css!" + SQUEBI.bower + "/bootstrap/dist/css/bootstrap",
    "css!" + SQUEBI.bower + "/codemirror/lib/codemirror",
    "css!" + SQUEBI.bower + "/codemirror/theme/neat",
    "css!" + SQUEBI.bower + "/codemirror/addon/hint/show-hint",
    "css!" + SQUEBI.bower + "/fontawesome/css/font-awesome",
    "css!squebi/css/style"
], function() {

    angular.element(document).ready(function($http,$rootScope) {

        var defaultConfig = {
            "selectService": "http://example.org/sparql/select",
            "updateService": "http://example.org/sparql/update",
            "samples": [
                {"name":"Select first 10 triples", "value":"SELECT * WHERE {\n  ?subject ?property ?object\n} LIMIT 10","type":"browse"},
                {"name":"List types", "value":"SELECT DISTINCT ?type WHERE {\n  [] a ?type\n} ORDER BY ?type","type":"browse"},
                {"name":"List properties", "value":"SELECT DISTINCT ?property WHERE {\n  [] ?property []\n} ORDER BY ?property","type":"browse"},
                {"name":"List classes and count their usage as pie chart", "value":"SELECT ?class (COUNT (?s) AS ?count) WHERE {\n  ?s a ?class\n}\nGROUP BY ?class\nORDER BY DESC(?count)","type":"piechart"},
                {"name":"Insert a new book to the bookstore","value":"PREFIX dc: <http://purl.org/dc/elements/1.1/>\nINSERT DATA {\n  <http://example/book1> dc:title \"A new book\" ;\n                         dc:creator \"A.N.Other\" .\n}"}
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
        jQuery(SQUEBI.container).show();
        squebi.constant('SQUEBI', defaultConfig);
        angular.bootstrap(SQUEBI.container, ['Squebi']);

    });
});