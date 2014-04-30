/**
 * XML Writer
 */
squebi.run( function($extension,SQUEBI){

    function buildLink(query) {
        var query = SQUEBI.selectService + "?query=" + encodeURIComponent(query) + "&out=xml";
        if(SQUEBI.queryParams) {
            for(var property in SQUEBI.queryParams) {
                query += "&" + property + "=" + SQUEBI.queryParams[property];
            }
        }
        return query;
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert","delete"]) != -1) {
            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            $rootScope.alerts.push(data.data);

        } else {
            $scope.data = data.data;
            $scope.href = buildLink(data.query);

            $scope.template = SQUEBI.app + '/squebi/template/data.html';
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.app + '/squebi/template/basic.html';
    }

    var writer = $extension.createResultWriter("xml","XML", "xml", "Displays SPARQL result as XML", onsuccess, onfailure);
    writer.position = 2;
});