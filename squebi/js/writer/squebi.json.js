/**
 * JSON Writer
 */
squebi.run( function($extension,SQUEBI){

    function buildLink(query) {
        var query = SQUEBI.selectService + "?query=" + encodeURIComponent(query) + "&out=json";
        if(SQUEBI.queryParams) {
            for(var property in SQUEBI.queryParams) {
                query += "&" + property + "=" + SQUEBI.queryParams[property];
            }
        }
        return query;
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert", "delete"]) != -1) {
            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            $rootScope.alerts.push(data.data);

        } else {
            $scope.data = angular.toJson(data.data, true);
            $scope.href = buildLink(data.query);

            $scope.template = SQUEBI.app + '/squebi/template/data.html';
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.app + '/squebi/template/basic.html';
    }

    var writer = $extension.createResultWriter("json","JSON", "json", "Displays SPARQL result as JSON", onsuccess, onfailure);
    writer.position = 3;
});