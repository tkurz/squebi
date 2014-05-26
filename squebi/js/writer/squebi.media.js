/**
 * Media Writer
 */
squebi.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://localhost:8080/DATA/**']);
});

squebi.run( function($extension,SQUEBI,$timeout){

    function buildLink(query) {
        return SQUEBI.serviceURL.select + "?query=" + encodeURIComponent(query) + "&output=json";
    }

    function getStyle(xywh) {
        var _w = Math.floor(600*(xywh[2]/100));
        var _h = Math.floor(340*(xywh[3]/100));
        var _l = -300 + 600*xywh[0]/100;
        var _t = 100 + 340*xywh[1]/100;
        return "width:"+_w+"px;height:"+_h+"px;margin-left:"+_l+"px;top:"+_t+"px";
    }

    function parseFragment(uri) {
        var fragment = {};

        if(uri.indexOf("#") == -1) return fragment;

        var hash = uri.substring(uri.lastIndexOf("#")+1);
        var values = hash.split("&");

        for(var i in values) {
            var nv = values[i].split("=");
            if(nv[0] == "t") {
                var se = nv[1].split(",");
                fragment.t = {
                    start: se[0],
                    end: se[1]
                }
            } else if(nv[0] == "xywh") {
                var xywh = nv[1].substring(8,nv[1].length).split(",");
                fragment.xywh = {
                    x:xywh[0],
                    y:xywh[1],
                    w:xywh[2],
                    h:xywh[3],
                    style: getStyle(xywh)
                }
            }
        }
        return fragment;
    }

    function transformData(data) {

        if(data.head.vars.length != 1) throw new Error("This result view only supports exact one binding");

        var assets = [];
        for(var i in data.results.bindings) {

            if(data.results.bindings[i][data.head.vars[0]].type != 'uri') throw new Error("Result set may only contain URIs");

            var uri = data.results.bindings[i][data.head.vars[0]].value;

            var type = undefined;

            if(uri.indexOf(".mp4") != -1 || uri.indexOf(".ogv") != -1 || uri.indexOf(".avi") != -1) {
                type = 'video'
            } else if(uri.indexOf(".png") != -1 || uri.indexOf(".jpg") != -1 || uri.indexOf(".gif") != -1) {
                type = 'image'
            }

            if(type == undefined) throw new Error("Result set may only contain Media URIs");

            var fragment = parseFragment(uri);
            assets.push({src:uri,type:type,fragment:fragment});
        }
        return assets;
    }

    var onsuccess = function($scope,data,$rootScope) {
        $scope.template = 'template/basic.html';
        if($.inArray(data.type, ["drop", "insert", "delete"]) != -1) {
            $rootScope.alerts.push(data.data);

        } else if($.inArray(data.type, ["select"]) == -1) {
            $rootScope.alerts.push({type:"warning",msg:"Query type is not supported"});

        } else {
            try {
                //check browser
                if(window.navigator.vendor != "Google Inc.") {
                    $rootScope.alerts.push({type:"warning",msg:"Demo is maybe not fully supported by your browser. It uses .mp4 videos and was tested for Google Chrome."});
                }

                $scope.data = transformData(data.data);
                $scope.singlevideo = false;
                $scope.selectVideo = function(video) {
                    $scope.singlevideo = video;
                }
                $scope.closeVideo = function() {
                    $scope.singlevideo = false;
                }
                $scope.template = SQUEBI.app + '/squebi/template/media.html';
            } catch(error) {
                $rootScope.alerts.push({type:"danger",msg:error.message});
            }

        }

    }

    var writer = $extension.createResultWriter("media","Media", "json", "Displays result as Media Asset List", onsuccess);
    writer.position = 6;
});