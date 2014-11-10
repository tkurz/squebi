/**
 * CSV Writer
 */
squebi.run( ['$extension','$http','SQUEBI', function($extension,SQUEBI){

    function buildLink(query) {
        var query = SQUEBI.selectService + "?query=" + encodeURIComponent(query) + "&out=csv";
        if(SQUEBI.queryParams) {
            for(var property in SQUEBI.queryParams) {
                query += "&" + property + "=" + SQUEBI.queryParams[property];
            }
        }
        return query;
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert", "delete"]) != -1) {
            $scope.template = SQUEBI.template + '/basic.html';
            $rootScope.alerts.push(data.data);

        } else {
            $scope.data = data.data, true;
            $scope.href = buildLink(data.query);

            $scope.template = SQUEBI.template + '/data.html';
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.template + '/basic.html';
    }

    var writer = $extension.createResultWriter("csv","CSV", {select:"text/csv"}, "Displays SPARQL result as CSV", onsuccess, onfailure);
    writer.position = 4;
}]);