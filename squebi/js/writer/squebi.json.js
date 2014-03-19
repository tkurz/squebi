/**
 * JSON Writer
 */
squeby.run( function($extension,SQUEBY){

    function buildLink(query) {
        return SQUEBY.serviceURL.select + "?query=" + encodeURIComponent(query) + "&output=json";
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert", "delete"]) != -1) {
            $scope.template = 'squebi/template/basic.html';
            $rootScope.alerts.push(data.data);

        } else {
            $scope.data = angular.toJson(data.data, true);
            $scope.href = buildLink(data.query);

            $scope.template = 'squebi/template/data.html';
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = 'squebi/template/basic.html';
    }

    var writer = $extension.createResultWriter("json","JSON", "json", "Displays SPARQL result as JSON", onsuccess, onfailure);
    writer.position = 2;
});