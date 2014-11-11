/**
 * Browsable
 */
squebi.run(['$extension','SQUEBI','$anchorScroll', function($extension,SQUEBI,$anchorScroll) {

    var config = {
        showFlags : false
    }

    if(SQUEBI.browse) jQuery.extend(config, SQUEBI.browse);

    //var query_for_resource = "PREFIX ###NAME###: <###NSP###>\n\nSELECT DISTINCT ?property ?hasValue ?isValueOf WHERE {\n  { ###URI### ?property ?hasValue }\nUNION\n  { ?isValueOf ?property ###URI### }\n} ORDER BY (!BOUND(?hasValue)) ?property ?hasValue ?isValueOf";
    //var query_for_property = "PREFIX ###NAME###: <###NSP###>\n\nSELECT DISTINCT ?resource ?value WHERE {\n  ?resource ###URI### ?value\n} ORDER BY ?resource ?value";
    //var query_for_class = "PREFIX ###NAME###: <###NSP###>\n\nSELECT DISTINCT ?instance WHERE {\n  ?instance a ###URI###\n} ORDER BY ?instance";

    var query_for_resource = "SELECT DISTINCT ?property ?hasValue ?isValueOf WHERE {\n  { ###URI### ?property ?hasValue }\nUNION\n  { ?isValueOf ?property ###URI### }\n}\nORDER BY ?property ?hasValue ?isValueOf\nLIMIT 1000";
    var query_for_property = "SELECT DISTINCT ?resource ?value WHERE {\n  ?resource ###URI### ?value\n}\nORDER BY ?resource ?value\nLIMIT 1000";
    var query_for_class = "SELECT DISTINCT ?instance WHERE {\n  ?instance a ###URI###\n}\nORDER BY ?instance\nLIMIT 1000";

    function getQuery(uri,name) {

        /*
        var namespaceIndex = Math.max(uri.lastIndexOf("/"),uri.lastIndexOf("#")) +1;
        var namespace = uri.substring(0, namespaceIndex);
        var ns_name = namespace in SQUEBI.namespaces ? SQUEBI.namespaces[namespace] : "nsp";
        var ns_uri = ns_name + ":" + uri.substring(namespaceIndex);
         */

        var ns_uri = "<"+uri+">";

        switch(name) {
            case 'property': return query_for_property.replace(/###URI###/g,ns_uri);//.replace(/###NSP###/g,namespace).replace(/###NAME###/g,ns_name);
            case 'class': return query_for_class.replace(/###URI###/g,ns_uri);//.replace(/###NSP###/g,namespace).replace(/###NAME###/g,ns_name);
            case 'type': return query_for_class.replace(/###URI###/g,ns_uri);//.replace(/###NSP###/g,namespace).replace(/###NAME###/g,ns_name);
            default : return query_for_resource.replace(/###URI###/g,ns_uri);//.replace(/###NSP###/g,namespace).replace(/###NAME###/g,ns_name);
        }

    }

    var getDisplayName = function(uri) {

        if(!uri) return "";

        var namespaceIndex = Math.max(uri.lastIndexOf("/"),uri.lastIndexOf("#")) +1;
        var namespace = uri.substring(0, namespaceIndex);

        if(namespace in SQUEBI.namespaces) {
            return SQUEBI.namespaces[namespace] + ":" + uri.substring(namespaceIndex);
        } else {
            return uri;
        }
    }

    var getDatatypeForBinding = function(binding) {
        if(binding.datatype) {
            return getDisplayName(binding.datatype);
        }
    }

    var getTitleForBinding = function(binding) {
        return binding.value + (binding['xml:lang'] ? '@'+binding['xml:lang'] : '') + (binding.datatype ? '^^'+binding.datatype : "");
    }

    var bindings;
    var offset;

    function drawData($scope) {

        var showBindings = bindings.slice(offset,offset+SQUEBI.pageSize);

        $scope.firstItem = offset+1;
        $scope.lastItem = offset+showBindings.length;

        $scope.showPrev = offset > 0;
        $scope.showNext = offset + showBindings.length < bindings.length;

        //$anchorScroll();

        $scope.bindings = showBindings;
        $scope.template = SQUEBI.home + '/template/browse.html';
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert", "delete"]) != -1) {

            $scope.template = SQUEBI.home + '/template/basic.html';
            $rootScope.alerts.push(data.data);

        } else if(data.type == 'construct') {
            $scope.template = SQUEBI.home + '/template/basic.html';
            $rootScope.alerts.push({type:"warning",msg:"Data Browser does not support 'Construct' queries. Use a different result writer!"});
        } else if(data.type == 'describe') {
            $scope.template = SQUEBI.home + '/template/basic.html';
            $rootScope.alerts.push({type:"warning",msg:"Data Browser does not support 'Describe' queries. Use a different result writer!"});
        } else if(data.type == 'ask') {
            $scope.template = SQUEBI.home + '/template/basic.html';
            if(data.data.boolean) {
                $rootScope.alerts.push({type:"success",msg:"The answer is YES."});
            } else {
                $rootScope.alerts.push({type:"success",msg:"The answer is NO."});
            }
        } else {


            $scope.getDisplayName = getDisplayName;

            $scope.transparent = SQUEBI.home + '/img/transparent.gif';

            $scope.headers = data.data.head.vars;
            bindings = data.data.results.bindings;

            $scope.showFlags = config.showFlags;

            $scope.selectURI = function(uri,name) {
                var query = getQuery(uri,name);
                $rootScope.$emit('setQuery',query);
            }

            $scope.prev = function() {
                offset = Math.max(0, offset-SQUEBI.pageSize);
                drawData($scope);
            }

            $scope.next = function() {
                offset = offset+SQUEBI.pageSize < $scope.resultSize ? offset+SQUEBI.pageSize : offset;
                drawData($scope);
            }

            $scope.getTitleForBinding = getTitleForBinding;

            $scope.getDatatypeForBinding = getDatatypeForBinding;

            $scope.resultSize = bindings.length;

            offset = 0;

            drawData($scope);
        }
    }

    var writer = $extension.createResultWriter("browse","Browse", "json", "Displays browsable SPARQL result", onsuccess);
    writer.position = 1;
    $extension.selectResultWriter(writer);
}]);