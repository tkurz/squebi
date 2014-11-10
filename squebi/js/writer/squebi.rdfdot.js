/**
 * Created by tkurz on 28.03.14.
 */
/**
 * RDF Dot Writer
 */
squebi.run( ['$extension','$http','SQUEBI','$log', function($extension,$http,SQUEBI,$log){

    function getImage(data, scope, rootScope) {
        $http({
            url: "http://demo4.newmedialab.at/rdfdot/render",
            method: "POST",
            data: data.data,
            params: {'output':'png', 'input':'xml', 'base64':true}
        })
            .success(function(data, status, headers, config) {
                rootScope.loader = false;
                scope.image = data;
            }).
            error(function(data, status, headers, config) {
                rootScope.loader = false;
                if(status==404) {
                    rootScope.alerts.push({type:"danger",msg:"No response from server. Server down or no internet connection"});
                } else {
                    rootScope.alerts.push({type:"warning",msg:"Could not render image"});
                }
            });
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["construct", "describe"]) != -1) {
            $scope.image = null;
            $rootScope.loader = true;

            $scope.template = SQUEBI.template + '/rdfdot.html';

            getImage(data, $scope, $rootScope);

        } else {
            $scope.template = SQUEBI.template + '/basic.html';
            $rootScope.alerts.push({type:"warning",msg:"Only Construct and Describe queries allowed"});
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.template + '/basic.html';
    }

    var writer = $extension.createResultWriter("rdfdot","RDF.dot", "xml", "Displays SPARQL Construct query as graph image", onsuccess, onfailure);
    writer.position = 6;
}]);