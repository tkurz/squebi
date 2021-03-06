/**
 * JSON Writer
 */
squebi.run(['$extension','SQUEBI', function($extension,SQUEBI){

    function buildLink(query) {
        var query = SQUEBI.selectService + "?query=" + encodeURIComponent(query) + "&" + SQUEBI.outputQueryParam + "=json";
        if(SQUEBI.queryParams) {
            for(var property in SQUEBI.queryParams) {
                query += "&" + property + "=" + SQUEBI.queryParams[property];
            }
        }
        return query;
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert", "delete"]) != -1) {
            $scope.template = SQUEBI.home  + '/template/basic.html';
            $rootScope.alerts.push(data.data);

        } else {
            $scope.data = angular.toJson(data.data, true);
            $scope.href = buildLink(data.query);

            $scope.template = SQUEBI.home + '/template/data.html';
        }

    };

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.home + '/template/basic.html';
    };

    var writer = $extension.createResultWriter("json","JSON", "json", "Displays SPARQL result as JSON", onsuccess, onfailure);
    writer.position = 3;
}]);