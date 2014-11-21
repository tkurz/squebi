squebi.run( ["$extension","SQUEBI", function($extension,SQUEBI){

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

        if(data.type != 'select') {
            $scope.template = SQUEBI.home + '/template/basic.html';
            alert("error");
            return;

        } else {
            $scope.images = [];
            var name = data.data.head.vars[0];
            for(var i in data.data.results.bindings) {
                if(data.data.results.bindings[i][name]) $scope.images.push(data.data.results.bindings[i][name].value);
            }
            $scope.template = SQUEBI.home + '/template/image.html'
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.home + '/template/basic.html';
    }

    var writer = $extension.createResultWriter("image","Image", "json", "Displays SPARQL result as Image", onsuccess, onfailure);
    writer.position = 5;
}]);