/**
 * Browsable
 */
squebi.run( function($extension,SQUEBI) {

    var config = {
        showFlags : true
    }

    if(SQUEBI.browse) jQuery.extend(config, SQUEBI.browse);

    //var query_for_resource = "PREFIX ###NAME###: <###NSP###>\n\nSELECT DISTINCT ?property ?hasValue ?isValueOf WHERE {\n  { ###URI### ?property ?hasValue }\nUNION\n  { ?isValueOf ?property ###URI### }\n} ORDER BY (!BOUND(?hasValue)) ?property ?hasValue ?isValueOf";
    //var query_for_property = "PREFIX ###NAME###: <###NSP###>\n\nSELECT DISTINCT ?resource ?value WHERE {\n  ?resource ###URI### ?value\n} ORDER BY ?resource ?value";
    //var query_for_class = "PREFIX ###NAME###: <###NSP###>\n\nSELECT DISTINCT ?instance WHERE {\n  ?instance a ###URI###\n} ORDER BY ?instance";

    var query_for_resource = "SELECT DISTINCT ?property ?hasValue ?isValueOf WHERE {\n  { ###URI### ?property ?hasValue }\nUNION\n  { ?isValueOf ?property ###URI### }\n} ORDER BY ?property ?hasValue ?isValueOf";
    var query_for_property = "SELECT DISTINCT ?resource ?value WHERE {\n  ?resource ###URI### ?value\n} ORDER BY ?resource ?value";
    var query_for_class = "SELECT DISTINCT ?instance WHERE {\n  ?instance a ###URI###\n} ORDER BY ?instance";

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

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert", "delete"]) != -1) {

            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            $rootScope.alerts.push(data.data);

        } else if(data.type == 'construct') {
            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            $rootScope.alerts.push({type:"warning",msg:"Data Browser does not support 'Construct' queries. Use a different result writer!"});
        } else if(data.type == 'describe') {
            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            $rootScope.alerts.push({type:"warning",msg:"Data Browser does not support 'Describe' queries. Use a different result writer!"});
        } else if(data.type == 'ask') {
            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            if(data.data.boolean) {
                $rootScope.alerts.push({type:"success",msg:"The answer is YES."});
            } else {
                $rootScope.alerts.push({type:"success",msg:"The answer is NO."});
            }
        } else {

            $scope.getDisplayName = getDisplayName;

            $scope.transparent = SQUEBI.app + '/squebi/img/transparent.gif';

            $scope.headers = data.data.head.vars;
            $scope.bindings = data.data.results.bindings;

            $scope.showFlags = config.showFlags;

            $scope.template = SQUEBI.app + '/squebi/template/browse.html';

            $scope.selectURI = function(uri,name) {
                var query = getQuery(uri,name);
                $rootScope.$emit('setQuery',query);
            }
        }
    }

    var writer = $extension.createResultWriter("browse","Browse", "json", "Displays browsable SPARQL result", onsuccess);
    writer.position = 1;
    $extension.selectResultWriter(writer);
});