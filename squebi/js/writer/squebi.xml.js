/**
 * XML Writer
 */
squeby.run( function($extension,SQUEBY){

    function buildLink(query) {
        return SQUEBY.serviceURL.select + "?query=" + encodeURIComponent(query) + "&output=xml";
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["drop", "insert","delete"]) != -1) {
            $scope.template = 'squebi/template/basic.html';
            $rootScope.alerts.push(data.data);

        } else {
            $scope.data = data.data;
            $scope.href = buildLink(data.query);

            $scope.template = 'squebi/template/data.html';
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = 'squebi/template/basic.html';
    }

    var writer = $extension.createResultWriter("xml","XML", "xml", "Displays SPARQL result as XML", onsuccess, onfailure);
    writer.position = 2;
});