/**
 * Created by tkurz on 28.03.14.
 */
/**
 * RDF Dot Writer
 */
squebi.run( function($extension,$http,SQUEBI){

    function getImage(data, scope, rootScope) {
        $http({
            url: "http://rdfdot.dev.redlink.io/rdfdot/render",
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
                rootScope.alerts.push({type:"error",msg:"Could not render image"});
            });
    }

    var onsuccess = function($scope,data,$rootScope) {

        if($.inArray(data.type, ["construct", "describe"]) != -1) {
            $scope.image = null;
            $rootScope.loader = true;

            $scope.template = SQUEBI.app + '/squebi/template/rdfdot.html';

            getImage(data, $scope, $rootScope);

        } else {
            $scope.template = SQUEBI.app + '/squebi/template/basic.html';
            $rootScope.alerts.push({type:"warning",msg:"Only Construct and Describe queries allowed"});
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.app + '/squebi/template/basic.html';
    }

    var writer = $extension.createResultWriter("rdfdot","RDF.dot", "xml", "Displays SPARQL Construct query as graph image", onsuccess, onfailure);
    writer.position = 6;
});