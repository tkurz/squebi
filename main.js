if(window.SQUEBI == undefined) SQUEBI = {};

SQUEBI.app = SQUEBI.app || ".";
SQUEBI.bower = SQUEBI.bower || "bower_components";
SQUEBI.container = SQUEBI.container || "#squebi";
SQUEBI.appLoader = SQUEBI.appLoader || "#appLoader";

requirejs.config({
    paths: {
        async : SQUEBI.bower + "/requirejs-plugins/src/async",
        propertyParser : SQUEBI.bower + "/requirejs-plugins/src/propertyParser",
        goog : SQUEBI.bower + "/requirejs-plugins/src/goog",
        jquery : SQUEBI.bower + "/jquery/dist/jquery",
        angular : SQUEBI.bower + "/angular/angular",
        angularLocalStorage : SQUEBI.bower + "/angular-local-storage/angular-local-storage",
        _bootstrap : SQUEBI.bower + "/bootstrap/dist/js/bootstrap",
        bootstrapUI : SQUEBI.bower + "/angular-bootstrap/ui-bootstrap",
        uiBootstrapTpls: SQUEBI.bower + "/angular-bootstrap/ui-bootstrap-tpls",
        _codemirror : SQUEBI.bower + "/codemirror/lib/codemirror",
        codemirrorSparql : SQUEBI.bower + "/codemirror/mode/sparql/sparql",
        codemirrorUI : SQUEBI.bower + "/angular-ui-codemirror/ui-codemirror",
        codemirrorHint : SQUEBI.bower + "/codemirror/addon/hint/show-hint",
        _squebi : "squebi/js/squebi",
        squebiBrowse : "squebi/js/writer/squebi.browse",
        squebiJson : "squebi/js/writer/squebi.json",
        squebiXml : "squebi/js/writer/squebi.xml",
        squebiCsv : "squebi/js/writer/squebi.csv",
        squebiPie: "squebi/js/writer/squebi.pie",
        squebiRdfdot: "squebi/js/writer/squebi.rdfdot",
        squebiMedia : "squebi/js/writer/squebi.media"
        //rdfstoreJs: SQUEBI.bower + "/rdfstore-js/dist/browser/rdf_store"
    },
    shim: {
        'goog': ['async','propertyParser'],
        'angular' : ['jquery'],
        '_bootstrap' : ['jquery'],
        'bootstrapUI' : ['angular','_bootstrap'],
        'angularLocalStorage' : ['angular'],
        'uiBootstrapTpls' : ['bootstrapUI'],
        'codemirrorSparql' : ['_codemirror'],
        'codemirrorUI' : ['_codemirror','bootstrapUI'],
        'codemirrorHint' : ['_codemirror'],
        '_squebi' : ['codemirrorHint','codemirrorUI','codemirrorSparql','bootstrapUI','uiBootstrapTpls','angularLocalStorage'],//,'rdfstoreJs'
        'squebiBrowse' : ['_squebi'],
        'squebiJson' : ['_squebi'],
        'squebiXml' : ['_squebi'],
        'squebiCsv' : ['_squebi'],
        'squebiRdfdot' : ['_squebi'],
        'squebiPie' : ['_squebi'],
        'squebiMedia' : ['_squebi']
    },map: {
        '*': {
            '_css': SQUEBI.bower + '/require-css/css'
        }
    }
});

require([
    "squebiBrowse",
    "squebiJson",
    "squebiXml",
    "squebiCsv",
    "squebiRdfdot",
    "squebiMedia",
    'goog!visualization,1,packages:[corechart]',
    "squebiPie",
    "_css!squebi/css/flags",
    "_css!" + SQUEBI.bower + "/bootstrap/dist/css/bootstrap",
    "_css!" + SQUEBI.bower + "/codemirror/lib/codemirror",
    "_css!" + SQUEBI.bower + "/codemirror/theme/neat",
    "_css!" + SQUEBI.bower + "/codemirror/addon/hint/show-hint",
    "_css!" + SQUEBI.bower + "/fontawesome/css/font-awesome",
    "_css!squebi/css/style"
], function() {

    angular.element(document).ready(function($http,$rootScope) {

        var defaultConfig = {
            "configurable" : false,
            "selectService": "http://example.org/sparql/select",
            "updateService": "http://example.org/sparql/update",
            "samples": [
                {"name":"Select first 10 triples", "value":"SELECT * WHERE {\n  ?subject ?property ?object\n} LIMIT 10","type":"browse"},
                {"name":"List types", "value":"SELECT DISTINCT ?type WHERE {\n  [] a ?type\n} ORDER BY ?type","type":"browse"},
                {"name":"List properties", "value":"SELECT DISTINCT ?property WHERE {\n  [] ?property []\n} ORDER BY ?property","type":"browse"},
                {"name":"List classes and count their usage as pie chart", "value":"SELECT ?class (COUNT (?s) AS ?count) WHERE {\n  ?s a ?class\n}\nGROUP BY ?class\nORDER BY DESC(?count)","type":"piechart"},
                {"name":"Draw a graph from data", "value":"CONSTRUCT {?a ?b ?c} WHERE {?a ?b ?c} LIMIT 5", "type":"rdfdot"},
                {"name":"Show me the video fragments where T. Gilkz shows a Backflip after a Backflip Heelclicker", "value":"PREFIX mm: <http://linkedmultimedia.org/sparql-mm/functions#>\nPREFIX ma: <http://www.w3.org/ns/ma-ont#>\nPREFIX dct: <http://purl.org/dc/terms/>\n\nSELECT (mm:boundingBox(?l3,?l2) AS ?result) WHERE {\n\t?f1 ma:locator ?l1; dct:subject <http://linkedmultimedia.org/data/concept/person/Tyrone_Gilkz>.\n\t?f2 ma:locator ?l2; dct:subject <http://linkedmultimedia.org/data/concept/trick/Backflip>.\n\t?f3 ma:locator ?l3; dct:subject <http://linkedmultimedia.org/data/concept/trick/Backflip_Heelclicker>.\n\n\tFILTER mm:temporalContains(?l1,?l2)\n\tFILTER mm:temporalContains(?l1,?l3)\nFILTER mm:after(?l2,?l3)} LIMIT 10", "type":"media"},
                {"name":"Show me a fragment that shows Connor Macfarlane", "value":'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\nPREFIX ma: <http://www.w3.org/ns/ma-ont#>\nPREFIX dct: <http://purl.org/dc/terms/>\n\nSELECT ?l2 WHERE {\n\t?f2 ma:locator ?l2; dct:subject ?p2.\n\t?p2 foaf:name "Connor Macfarlane".\n}', "type":"media"},
                {"name":"Show me the tempo-regional fragments where Lewis Jones is right beside Connor Macfarlane", "value":'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\nPREFIX mm: <http://linkedmultimedia.org/sparql-mm/functions#>\nPREFIX ma: <http://www.w3.org/ns/ma-ont#>\nPREFIX dct: <http://purl.org/dc/terms/>\n\nSELECT (mm:boundingBox(?l1,?l2) AS ?left_right) WHERE {\n\t?f1 ma:locator ?l1; dct:subject ?p1.\n\t?p1 foaf:name "Lewis Jones".\n\t?f2 ma:locator ?l2; dct:subject ?p2.\n\t?p2 foaf:name "Connor Macfarlane".\n\n\tFILTER mm:rightBeside(?l1,?l2)\n\tFILTER mm:temporalOverlaps(?l1,?l2)\n}', "type":"media"},
                {"name":"Insert a new book to the bookstore","value":"PREFIX dc: <http://purl.org/dc/elements/1.1/>\nINSERT DATA {\n  <http://example/faust1> dc:title \"Faust I\" ;\n                         a <http://example/Book> ;\n                         dc:creator <http://example.org/goethe> .\n}"},
                {"name":"List all books","value":"SELECT ?book WHERE {?book a <http://example/Book>}","type":"browse"}
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
        jQuery(SQUEBI.appLoader).hide();
        jQuery(SQUEBI.container).show();
        squebi.constant('SQUEBI', defaultConfig);
        angular.bootstrap(SQUEBI.container, ['Squebi']);

    });
});