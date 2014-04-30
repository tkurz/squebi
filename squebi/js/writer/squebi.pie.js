/**
 * PIE Chart Writer
 */

squebi.directive('piechart', function ($location) {

    var query = "SELECT DISTINCT ?property ?hasValue ?isValueOf WHERE {\n  { ###URI### ?property ?hasValue }\nUNION\n  { ?isValueOf ?property ###URI### }\n} ORDER BY (!BOUND(?hasValue)) ?property ?hasValue ?isValueOf";

    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            var data = undefined;

            var options = {
                title: attrs.title ? attrs.title : undefined,
                width: attrs.width ? attrs.width : 900,
                height:attrs.height ? attrs.height : 500
            }

            var chart = new google.visualization.PieChart(elem[0]);

            scope.$watch("data",function(d){
                if(d !=  undefined) {
                    data = d;
                    chart.draw(data,options);
                }
            });

            google.visualization.events.addListener(chart, 'select', function() {
                scope.$apply(function(){
                    $location.search({
                        query:query.replace(/###URI###/g,"<"+data.getValue(chart.getSelection()[0].row, 0)+">"),
                        writer:'browse'
                    })
                })
            });
        }
    }
})

squebi.run( function($extension,SQUEBI) {

    function transformData(d) {

        if(d.head.vars.length != 2) throw new Error("Cannot transform data: result must contain exact 2 bindings!");

        var data = [];
        data.push(d.head.vars);

        if(d.results.bindings.length == 0 || d.results.bindings.length == 1 && d.results.bindings[0][d.head.vars[1]] && d.results.bindings[0][d.head.vars[1]].value == "0") {
            return undefined;
        }

        for(var i in d.results.bindings) {
            var binding = d.results.bindings[i];
            var v1 = binding[d.head.vars[0]].value;
            var v2 = binding[d.head.vars[1]].value;

            if(v2 > 0) {
                var f = parseFloat(v2);
                data.push([v1,f]);
            } else throw new Error("Cannot transform data: second binding has to be a positive number!");
        }

        data = google.visualization.arrayToDataTable(data);

        return data;
    }

    var query_for_resource = "SELECT DISTINCT ?property ?hasValue ?isValueOf WHERE {\n  { <###URI###> ?property ?hasValue }\nUNION\n  { ?isValueOf ?property <###URI###> }\n} ORDER BY (!BOUND(?hasValue)) ?property ?hasValue ?isValueOf";

    var onsuccess = function($scope,data,$rootScope) {

        $scope.template = SQUEBI.app + '/squebi/template/basic.html';

        if(data.type != 'select') {
            $rootScope.alerts.push({type:"warning",msg: "Query type is not supported!"});
            return;
        }

        try {
            $scope.data = transformData(data.data);
            //$scope.selected = undefined;

            if($scope.data == undefined) {
                $rootScope.alerts.push({type:"info",msg: "Result contains 0 data sets!"});
            } else {

                /*TODO $scope.$watch("selected",function(sel) {
                    if(sel != undefined) {
                        $rootScope.$emit('setQueryAndWriter',query_for_resource.replaceAll("###URI###", sel),'browse');
                    }
                })*/

                $scope.template = SQUEBI.app + '/squebi/template/pie.html';
            }
        } catch(e) {
            $rootScope.alerts.push({type:"danger",msg: e.message});
        }

    }

    var onfailure = function($scope,data,$rootScope) {
        $scope.template = SQUEBI.app + '/squebi/template/basic.html';
    }

    var writer = $extension.createResultWriter("piechart","Piechart", "json", "Displays SPARQL result as Pie Chart", onsuccess, onfailure);
    writer.position = 5;
});