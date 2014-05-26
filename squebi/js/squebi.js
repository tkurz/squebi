/**
 * the app
 * @type {module|*}
 */
var squebi = angular.module( 'Squebi',[
    'ui.codemirror',
    'ui.bootstrap',
    'LocalStorageModule'
]);

squebi.config(['localStorageServiceProvider', function(localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('squebi.');
}]);

/**
 * To register
 */
squebi.service("$extension", function ($rootScope) {

    var extension = {
        resultWriter : []
    };

    function ResultWriter(id,label,format,description,onsuccess,onfailure) {
        this.position = -1;
        this.id = id;
        this.label = label;
        this.description = description;
        this.format = format;
        this.onsuccess = onsuccess;
        this.onfailure = function($scope,data){
            $rootScope.alerts.push(data);
            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            if(onfailure) onfailure($scope,data);
        };
    }

    this.createResultWriter = function(label,type,description,onsuccess,onfailure) {
        var resultWriter = new ResultWriter(label,type,description,onsuccess,onfailure);
        extension.resultWriter.push(resultWriter);
        return resultWriter;
    }

    this.listResultWriters = function() {
        //order
        extension.resultWriter = extension.resultWriter.sort(function(a,b) {
            return a.position <= b.position ? -1 : 1;
        });
        return extension.resultWriter;
    }

    this.selectResultWriter = function(writer) {
        $rootScope.writer = writer;
    }

    this.selectResultWriterById = function(id) {
        for(var i in extension.resultWriter) {
            if(extension.resultWriter[i].id == id) {
                $rootScope.writer = extension.resultWriter[i];
                break;
            }
        }  //TODO should throw an exception?
    }

});

/**
 * a service for sparql endpoints
 */
squebi.service("$sparql", function ($http, SQUEBI) {
    this.query = function(query, options, onsuccess, onfailure) {
        $http({
            url: SQUEBI.selectService,
            method: "POST",
            data: query,
            params: SQUEBI.queryParams,
            headers: {
                'Content-Type': 'application/sparql-query',
                'Accept': options.acceptType
            }
        })
            .success(function(data, status, headers, config) {
                onsuccess(data);
            }).
            error(function(data, status, headers, config) {
                onfailure(data);
            });
    }

    this.update = function(query, options, onsuccess, onfailure) {
        $http({
            url: SQUEBI.updateService,
            method: "POST",
            data: query,
            params: SQUEBI.queryParams,
            headers: {
                'Content-Type': 'application/sparql-update'
            }
        })
            .success(function(data, status, headers, config) {
                onsuccess(data);
            }).
            error(function(data, status, headers, config) {
                onfailure(data);
            });
    }
});

/**
 * A controller to load sample queries from configuration
 */
squebi.controller( 'SampleCtrl', function( SQUEBI, $rootScope, $sparql, $http, $scope, $sce ) {

    $scope.showHint = false;
    $scope.configurable = SQUEBI.configurable;
    $scope.hint = SQUEBI.hints && SQUEBI.hints.length > 0;
    $scope.hints = [];

    function buildHint(hint) {
        var div = jQuery("#"+hint.container);

        switch(hint.position) {
            case 1: hint.style = "top:" + (div.offset().top - hint.dimension.height) + "px;left:" + (div.offset().left + div.width()) + ";";break;
            case 2: hint.style = "top:" + (div.offset().top + div.height()) + "px;left:" + (div.offset().left + div.width()) + ";";break;
            case 3: hint.style = "top:" + (div.offset().top + div.height()) + "px;left:" + (div.offset().left - hint.dimension.width) + ";";break;
            default : hint.style = "top:" + (div.offset().top - hint.dimension.height) + "px;left:" + (div.offset().left - hint.dimension.width) + ";";
        }

        hint.style += "width:" + hint.dimension.width + "px;";
        hint.style += "height:" + hint.dimension.height + "px;";

        if(hint.css) hint.style += hint.css;

        hint.trusted_content = $sce.trustAsHtml(hint.content);

        return hint;
    }

    $scope.showHints = function() {

        $scope.hints = [];

        //prepare hints
        for(var i in SQUEBI.hints) {
            $scope.hints.push(buildHint(SQUEBI.hints[i]));
        }

        $scope.showHint = true;
    }

    $scope.samples = SQUEBI.samples;

    $rootScope.sample = $scope.samples[0].value;

    $scope.selectSample = function(sample) {
        if(sample.type) {
            $rootScope.$emit('setQueryAndWriter', sample.value, sample.type);
        } else {
            $rootScope.$emit('setQuery', sample.value);
        }
    }
});


squebi.controller( 'FormatCtrl', function( SQUEBI, $extension, $rootScope, $sparql, $http, $scope ) {

    $scope.writers = $extension.listResultWriters();

    $rootScope.writer = $rootScope.writer || $scope.writers[0];

    $scope.getClass = function(writer) {
        if(writer == $rootScope.writer) return 'active';
    }

    $scope.selectWriter = function($event,writer) {
        $rootScope.$emit('setWriter',writer.id);
        $event.preventDefault();
    }
});

/**
 * A controller that issues the query
 */
squebi.controller( 'QueryCtrl', function( SQUEBI, $rootScope, $sparql, $http, $scope, $location, $extension ) {

    $scope.query = $rootScope.sample;

    $rootScope.showResults = true;

    /*function getSuggestions(uri) {

        var suggestions = [];

        rdfstore.create(function(store) {
            store.load('remote', uri, function(success, result) {
                if(success) {
                    store.execute('PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT ?property ?label ?comment WHERE {{?property a rdfs:Class; rdfs:label ?label; rdfs:comment ?comment} UNION {?property a rdf:Property; rdfs:label ?label; rdfs:comment ?comment}}', function(success, results) {
                        for(var i in results) {
                            suggestions.push({
                                property:results[i].property.value,
                                label:results[i].label.value,
                                comment:results[i].comment.value
                            })
                        }
                        console.log(suggestions);
                    })
                }
            });
        });
    }*/

    var suggestRegex = new RegExp("\\s+([A-Za-z]+):([A-Za-z]+)$",'ig');

    function checkSuggestion(cm) {
        var c = cm.getCursor();
        var line = cm.getRange({'line': c.line, 'ch': 0},{'line': c.line, 'ch': c.ch});
        var match = suggestRegex.exec(line);
        if(match) {
            for(var property in SQUEBI.namespaces) {
                if(SQUEBI.namespaces[property] == match[1]) {
                    var prefix = property+match[2];
                    var query = 'SELECT DISTINCT ?uri WHERE {{[] ?uri [].FILTER(STRSTARTS(STR(?uri), "'+prefix+'"))} UNION {[] ?b ?uri.FILTER(STRSTARTS(STR(?uri), "'+prefix+'"))}}'

                    function replace(replacement,from,to) {
                        cm.setSelection(from, to);
                        cm.replaceSelection(replacement);
                        c.ch = c.ch + replacement.length;
                        cm.setCursor(c);
                    }

                    var key = (SQUEBI.queryParams && SQUEBI.queryParams.key) ? "&key=" + SQUEBI.queryParams.key : "";

                    jQuery.ajax(SQUEBI.selectService + "?query=" + encodeURIComponent(query) + "&out=json" + key, {
                         async: false,
                         dataType: "json",
                         success: function(data) {

                             var list = [];

                             var from = {line: c.line, ch: c.ch - match[0].length};
                             var to = {line: c.line, ch: c.ch};

                             for(var i = 0; i < data.results.bindings.length; i++) {
                                 var r = SQUEBI.namespaces[property]+":"+data.results.bindings[i].uri.value.substring(property.length);
                                 (function(r){
                                     list.push({
                                         text: r,
                                         hint: function() {
                                             replace(" "+r+" ",from, to);
                                         }
                                     });
                                 }(r))
                             }

                             CodeMirror.showHint(cm, function(cm, self, data) {
                                 return {
                                     list: list,
                                     from: from,
                                     to: to
                                 }
                             },{
                                 completeSingle: false
                             });
                         }
                     });
                }
            }
        }
    }

    /**
     * Autocompletion using prefix.cc
     * @param cm
     */
    function checkAutocomplete(cm) {

        var c = cm.getCursor();
        var line = cm.getRange({'line': c.line, 'ch': 0},{'line': c.line, 'ch': c.ch});
        if(line[line.length - 1] == ':') {
            //get prefix
            var prefix = /.*[\s.,;\{\}]([^:]+):$/g.exec(line)[1];

            var text = cm.getValue();

            var regex = new RegExp("PREFIX\\s+" + prefix + ":\\s*<",'ig');

            //if prefix is not yet defined
            if(!text.match(regex)) {

                CodeMirror.showHint(cm, function(cm, self, data) {

                    var result;

                    //check if it is in static
                    for(var property in SQUEBI.namespaces) {
                        if(SQUEBI.namespaces[property] == prefix) {
                            result = property;
                            break;
                        }
                    }

                    if(result == undefined) {
                        try {
                            jQuery.ajax('http://prefix.cc/' + prefix + '.file.json', {
                                async: false,
                                success: function(data) {
                                    result = data[prefix];
                                    SQUEBI.namespaces[result] = prefix;
                                },
                                dataType: "json"
                            });
                        } catch (e) {}
                    }

                    if (result !== undefined) {
                        return {
                            list: [{
                                text: "add prefix " + prefix + ": <" + result + ">",
                                hint: function() {

                                    var regex = new RegExp(".*(PREFIX\\s+" + prefix + ":)$",'ig');

                                    if( line.match(regex) ) {
                                        var replacement = " <" + result + ">";
                                        cm.replaceSelection(replacement);
                                        c.ch = c.ch + replacement.length;
                                        cm.setCursor(c);
                                    } else {
                                        c.line = c.line + 1;
                                        cm.setValue("PREFIX " + prefix + ": <" + result+">\n" + cm.getValue());
                                        cm.setCursor(c);
                                    }
                                }

                            }],
                            from: {line: c.line, ch: c.ch - prefix.length},
                            to: {line: c.line, ch: c.ch}
                        }
                    }

                },{
                    completeSingle: false
                });
            } else {
                //get suggestions for prefix


                /*for(var property in SQUEBI.namespaces) {
                    if(SQUEBI.namespaces[property] == prefix) {
                        getSuggestions(property);
                    }
                }*/
            }
        }
    }

    //codemirror
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'sparql',
        theme: 'mdn-like sparql-mm',
        //extraKeys: {"Ctrl-Space": "autocomplete"},
        onKeyEvent: function(i, e) {
            if(e.type == 'keyup') {
                if(e.keyIdentifier == "Shift") {
                    checkAutocomplete(i);
                } else {
                    checkSuggestion(i);
                }
            }
        }
    };

    /**
     * A regex used for query type evaluation
     * @type {RegExp}
     */
    var query_regex = /(DROP)|(INSERT)|(DELETE)|(ASK)|(SELECT)|(CONSTRUCT)|(DESCRIBE)\s/i;

    /**
     * returns the query type if it can be evaluated, undefined otherwise
     * @param query
     * @returns {string}
     */
    function getQueryType(query) {
        var match = query_regex.exec(query);
        return match != undefined ? match[0].toLowerCase() : undefined;
    }

    /**
     * run the query
     */
    $scope.runQuery = function() {
        $rootScope.alerts = [];

        var type = getQueryType($scope.query.trim());

        $rootScope.loader = true;

        switch (type.trim()) {
            case 'insert':
            case 'delete':
            case 'drop':

                $rootScope.showResults = false;

                if(!SQUEBI.updateAllowed) {
                    $rootScope.alerts.push({type: 'info', msg: 'Update queries are not allowed'});
                    break;
                }
                
                $sparql.update(
                    $scope.query.trim(),
                    {},
                    function(){
                        $rootScope.$emit('querySuccess',{type:type.trim(), data:{type: 'info', msg: 'Query performed successful'}});
                    }, function(data){
                        $rootScope.$emit('queryFailure',{type: 'danger', msg: data instanceof Object ? data.message : data});
                    }
                );
                break;
            case 'ask':
            case 'select':
            case 'construct':
            case 'describe':

                var format = undefined;
                if(typeof($rootScope.writer.format) === "string") { //because of backwards compatibility
                    format = type.trim() == 'select' ? 'application/sparql-results+' + $rootScope.writer.format : 'application/' + $rootScope.writer.format;
                } else {
                    if($rootScope.writer.format[type.trim()] == undefined) {
                        $rootScope.alerts.push({type: 'warning', msg: 'Query is not supported'});
                        $rootScope.loader = false;
                        break;
                    } else {
                        format = $rootScope.writer.format[type.trim()];
                    }
                }


                $rootScope.showResults = true;
                
                $sparql.query(
                    $scope.query.trim(),
                    {acceptType: format},
                    function(data){
                        $rootScope.$emit('querySuccess',{type:type.trim(), data:data, query:$scope.query.trim()});
                    }, function(data){
                        $rootScope.$emit('queryFailure',{type: 'danger', msg: data instanceof Object ? data.message : data});
                    }
                );
                break;

            default :
                $rootScope.alerts.push({type: 'warning', msg: 'Query is not supported'});
                $rootScope.loader = false;
        }
    }

    // TODO workaround for codemirror bug
    var query = angular.copy($scope.query);
    $scope.$watch('query',function(a,b){
        if(a!="") query = a;
    })

    $scope.triggerQuery = function() {
        $location.search("query",query);
    }

    $scope.$on('$locationChangeSuccess', function () {

        if($location.search().query == undefined || $location.search().writer == undefined) {
            $location.search({
                query: $location.search().query ? $location.search().query : $scope.query,
                writer: $location.search().writer ? $location.search().writer : $rootScope.writer.id
            });
        } else {
            $scope.query = $location.search().query;
            $extension.selectResultWriterById($location.search().writer);
            $scope.runQuery();
        }
    });

    $rootScope.$on('setQuery', function(e,data) {
        $location.search("query",data);
    });

    $rootScope.$on('setQueryAndWriter', function(e,query,writer) {
        $location.search({
            "query": query,
            "writer": writer
        });
    });

    $rootScope.$on('setWriter', function(e,data) {
        $location.search("writer",data);
    });

});

/**
 * A controller to support alert messages
 */
squebi.controller( 'AlertCtrl', function( SQUEBI, $timeout, $rootScope, $scope ) {

    $rootScope.alerts = [];

    /**
     * remove alert
     * @param alert
     */
    $scope.remove = function(alert) {
        var index = $rootScope.alerts.indexOf(alert);
        if(index != -1) $rootScope.alerts.splice(index,1);
    };
});

squebi.controller( 'ResultCtrl', function( SQUEBI, $timeout, $rootScope, $scope ) {

    $scope.template = SQUEBI.app + '/squebi/template/basic.html';

    $rootScope.$on('querySuccess', function(e,data) {
        $rootScope.alerts = [];
        $rootScope.writer.onsuccess($scope,data,$rootScope);
        $rootScope.loader = false;
    });

    $rootScope.$on('queryFailure', function(e,data) {
        $rootScope.alerts = [];
        $rootScope.writer.onfailure($scope,data,$rootScope);
        $rootScope.loader = false;
    });

});

squebi.controller( 'ConfigurationCtrl', function ($scope, $modal, SQUEBI, localStorageService) {

    var queryParams = [];

    for(var property in SQUEBI.queryParams) {
        queryParams.push({name:property,value:SQUEBI.queryParams[property]});
    }

    $scope.data = {
        updateService: SQUEBI.updateService,
        selectService: SQUEBI.selectService,
        queryParams : queryParams
    }

    var ModalInstanceCtrl = function ($scope, $modalInstance, data) {

        $scope.data = data;

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.store = function () {
            $modalInstance.close($scope.data);
        };

        $scope.reset = function() {
            $modalInstance.close();
        }
    };

    $scope.open = function () {

        $modal.open({
            templateUrl: 'configuration.html',
            controller: ModalInstanceCtrl,
            resolve: {
                data: function () {
                    return $scope.data;
                }
            }
        }).result.then(function(data){

            if(data == undefined) {

                localStorageService.clearAll();
                window.location.reload(false);

            } else {

                SQUEBI.updateService = data.updateService;
                localStorageService.set('updateService', data.updateService);

                SQUEBI.selectService = data.selectService;
                localStorageService.set('selectService', data.selectService);

                SQUEBI.queryParams = {};
                for(var i in data.queryParams) {
                    SQUEBI.queryParams[data.queryParams[i].name] = data.queryParams[i].value;
                }
                localStorageService.set('queryParams', SQUEBI.queryParams);
            }
        });
    };
});

squebi.run(function(localStorageService, SQUEBI) {
    if(localStorageService.get('updateService')) SQUEBI.updateService = localStorageService.get('updateService');
    if(localStorageService.get('selectService')) SQUEBI.selectService = localStorageService.get('selectService');
    if(localStorageService.get('queryParams')) SQUEBI.queryParams = localStorageService.get('queryParams');
});

