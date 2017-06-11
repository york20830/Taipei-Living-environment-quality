jQuery.ajax = (function (_ajax) {

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol) ? 's' : '') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';

    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }

    return function (o) {
        var url = o.url;
        if (/get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url)) {

            // Manipulate options so that JSONP-x request is made to YQL

            o.url = YQL;
            o.dataType = 'json';

            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data) :
                        '')
                ),
                format: 'xml'
            };

            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            o.success = (function (_success) {
                return function (data) {

                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }

                };
            })(o.success);
        }
        return _ajax.apply(this, arguments);
    };

})(jQuery.ajax);

function loadJson(urlname) {
    var result;
    $.ajax({
        type: 'GET',
        url: urlname,
        dataType: 'json',
        async: false,
        success: function (data) {
            console.log('success!');
            result = data;
        },
        error: function () {
            console.log('failed.');
        }
    });
    return result;
};


//need use leaflet function L.geoJson
function loadGeoJson(urlname) {
    var data = loadJson(urlname);
    return L.geoJson(data);
};

function loadCSV(urlname) {
    var result;
    $.ajax({
        type: 'GET',
        url: urlname,
        dataType: 'text',
        async: false,
        success: function (data) {
            console.log('success!');
            result = data;
        },
        error: function () {
            console.log('failed.');
            return false;
        }
    });
    return result;
};

function csvJSON(csv) {

    var lines = csv.split("\n");

    var result = [];

    var headers = lines[0].replace("\r", "").split(",");

    for (var i = 1; i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].replace("\r", "").split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
};




function GenerateTable() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(xhttp.responseText);
            var testYoubike = obj.retVal;
            var count;

            var out = "<table id = 'youbiketable1' class='table tablesorter table-condensed table-hover table-bordered'><thead><tr><th>DataName</th><th>Value</th><th>latitude</th><th>longtitude</th></tr></thead><tbody>";



            for (var key in testYoubike) {
                out += "<tr><td>" + testYoubike[key].sna + "</td><td>" + testYoubike[key].tot + "</td><td>" + testYoubike[key].lat + "</td><td>" + testYoubike[key].lng + "</td></tr>";

                count += key;
            };
            out += "</tbody></table>";
            document.getElementById("tableArea").innerHTML = out;
        }
    };
    xhttp.open("GET", "datas/YouBikeTP.json", true);
    xhttp.send();
};

function DataList() {
    $.get('datas/042.txt', function (response) {
        var html = "";
        var cells = "";
        var rows = response.split("\n");

        for (var i = 1; i < rows.length - 1; i++) {
            cells = rows[i].split("\t");
            html += '<li style="font-size:15px;background-color:yellow"><a onclick="GenerateTable()">' + cells[0] + '</a></li>';
        };
        console.log(html);
        document.getElementById("04list").innerHTML = html;
    });
};

function loadDataList(urlname, num) {
    if (!loadCSV(urlname)) {
        console.log('failed.');
        return false;
    } else {
        var data = JSON.parse(csvJSON(loadCSV(urlname)));

        //var lines = data.split("\n");
        //var result = "";
        //var headers=lines[0].replace("\r","").split(",");
        var html = "";

        for (var key in data) {
            console.log(data[key]['使用圖層']);
            if (data[key]['最終使用'] == 1) {
                html += '<li style="font-size:15px;background-color:black"><a  onclick="addLayer(leafmap,' + data[key]['程式資料命名'] + '.choropleth)" ondblclick="removeLayer(leafmap,' + data[key]['程式資料命名'] + '.choropleth)">' + data[key]['使用圖層'] + '</a></li>';
            };
        };
        //        for(var i=1; i<lines.length-1;i++){
        //            result = lines[i].split(",");
        //            if(result[12]==1){
        //                html += '<li style="font-size:15px;background-color:black"><a  onclick="addLayer(leafmap,'+result[11]+'.cluster)" ondblclick="removeLayer(leafmap,'+result[11]+'.cluster)">'+ result[1] + '</a></li>';
        //            };
        //        };
        document.getElementById("04list").innerHTML = html;
    };

};


function loadDataList2(urlname, num) {
    if (!loadCSV(urlname)) {
        console.log('failed.');
        return false;
    } else {
        var data = JSON.parse(csvJSON(loadCSV(urlname)));
        var html = "";
        for (var key in data) {
            console.log(data[key]['使用圖層']);
            if (data[key]['最終使用'] == 1) {
                html += '<li><a href="#" class="toggle-custom" id="' + data[key]['ID'] + '" data-toggle="collapse" data-target="#' + data[key]['ID'] + '_' + data[key]['程式資料命名'] + '" aria-expanded="false">' + data[key]['使用圖層'] + '</a>' + '<ul class="nav collapse" id="' + data[key]['ID'] + '_' + data[key]['程式資料命名'] + '" role="menu" aria-labelledby="' + data[key]['ID'] + '">';
                switch (data[key]['呈現方法1']) {
                    case 'choropleth':
                        html += '<li>Classify:<input type="number" id="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'classic" max="15" min="3" class="clean short small-input" value="5" step="1" style="color: blue;"/></li> <li> Mode: <select id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'mode"style = "color: blue;"> ' + ' <option value = "e">equal interval<option value = "q">quantile<option value = "k">k - mean ' + ' </select></li><li>Opacity: <input type = "range" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'opacity"  class = "clean short small-input" max = "100" min = "0" value = "80" style = "color: blue;" /> </li><li> Colors: <input type = "color" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'color1" value = "#DFE3AB"/> <input type = "color" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'color2" value = "#A13936" /></li>';
                        break;
                    case 'heat':

                        break;
                    case 'buffer':

                        break;
                    case 'cluster':

                        break;
                    case 'icon':

                        break;
                    case 'color':

                        break;
                    case 'category':

                        break;
                    case 'soil':
                        break;
                    default:
                };
                html += '</ul></li>';
            };
        };
        document.getElementById("04list").innerHTML = html;
    };
};

function boxControl(id, map, data, layer_name, legend) {
    if ($('#' + id + '_' + layer_name + '_checkbox').is(":checked")) {
        initialize(id, map, data, layer_name, legend);
        $(".locked").click(function () {
            return true;
        });
    } else {
        removeDataLayer(map, data);

        $(".locked").click(function () {
            return false;
        });
    };

};

function loadDataList3(urlname, divid) {
    if (!loadCSV(urlname)) {
        console.log('failed.');
        return false;
    } else {
        var data = JSON.parse(csvJSON(loadCSV(urlname)));
        var html = "&nbsp;<br>";
        var op;
        switch (divid) {
            case 'safety':
                op = '安全性'
                break;
            case 'health':
                op = '健康性'
                break;
            case 'amenity':
                op = '寧適性'
                break;
            case 'convenience':
                op = '便利性'
                break;
            default:
                op = 'all'
        };
        for (var key in data) {
            console.log(op);
            if (data[key]['最終使用'] == 1 && (op == data[key]['使用分類'])) {
                html += '<li class="layerbtnlist"><a class="toggle-custom" id="' + data[key]['ID'] + '" data-toggle="collapse" data-target="#' + data[key]['ID'] + '_' + data[key]['程式資料命名'] + '" aria-expanded="false"  style="display:-webkit-inline-box"><input class="layer-btn" type="checkbox" id="' + data[key]['ID'] + '_' + data[key]['程式資料命名'] + '_checkbox' + '" onchange="boxControl(' + data[key]['ID'] + ',leafmap,' + data[key]['程式資料命名'] + ",'" + data[key]['程式資料命名'] + "'" + ')" data-toggle="toggle" data-size="small"><div class="locked container" style="padding:0px;margin:0px;width: 100%">' + data[key]['使用圖層(簡化)'] + '</div></a>' + '<ul class="nav collapse" id="' + data[key]['ID'] + '_' + data[key]['程式資料命名'] + '" role="menu" aria-labelledby="' + data[key]['ID'] + '">';
                switch (data[key]['呈現方法1']) {
                    case 'choropleth':
                        html += '<li>Classify:<input type="number" id="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'classic" max="15" min="3" class="clean short small-input" value="5" step="1" style="color: blue;" onchange="updateChoropleth(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')"/></li> <li> Mode: <select id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'mode"style = "color: blue;" onchange="updateChoropleth(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')"> ' + ' <option value = "e">equal interval<option value = "q">quantile<option value = "k">k - mean ' + ' </select></li><li>Opacity: <input type = "range" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'opacity"  class = "clean short small-input" max = "100" min = "0" value = "80" style = "color: blue;" onchange="updateChoropleth(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')"/> </li><li> Colors: <input type = "color" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'color1" value = "#DFE3AB" onchange="updateChoropleth(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')"/> <input type = "color" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'color2" value = "#A13936" onchange="updateChoropleth(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')"/></li>';
                        break;
                    case 'heat':
                        html += '<li>Radius: <input type = "range" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'radius"  class = "clean short small-input" max = "80" min = "1" value = "5" style = "color: blue;" onchange="updateHeat(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')"/></li>';
                        break;
                    case 'buffer':
                        html += '<li>Range:<input type="number" id="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'range" class="clean short small-input" value="500" step="10" style="color: blue;" onchange="updateBuffer(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ",'" + data[key]['ICON'] + "'" + ')"/></li><li>Opacity: <input type = "range" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'opacity"  class = "clean short small-input" max = "100" min = "0" value = "80" style = "color: blue;" onchange="updateBuffer(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ",'" + data[key]['ICON'] + "'" + ')"/></li><li> Colors: <input type = "color" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'color" value = "#DFE3AB" onchange="updateBuffer(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ",'" + data[key]['ICON'] + "'" + ')"/><li>';
                        break;
                    case 'cluster':

                        break;
                    case 'icon':

                        break;
                    case 'color':
                        //done
                        break;
                    case 'category':
                        var temp = 'data/' + data[key]['處理完檔案名稱(最終)'];
                        var filterarray = findFilter(loadJson(temp), data[key]['使用欄位']);
                        html += '<li>Category:<select id="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'key' + '" onchange="updateCategory(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')" style="color:rgba(0,0,0,1)">';
                        for (var i = 0; i < filterarray.length; i++) {
                            html += '<option value="' + filterarray[i] + '">' + filterarray[i];
                        };
                        html += '</select></li>';
                        break;
                    case 'soil':
                        html += '<li>Opacity: <input type = "range" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'opacity"  class = "clean short small-input" max = "100" min = "0" value = "60" style = "color: blue;" onchange="updateSoil(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ')"/></li>';
                        break;
                    case 'flooded':
                        html += '<p><label for="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_info">時間期間：</label><input type="text" id="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_info" readonly style="margin: 0px auto;width:96%;font-size:22px; color:#BF40A6;"></p><div id="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_time" style="margin: 0px auto;width:70%"></div>';
                        var tempid = data[key]['ID'];
                        $(function () {
                            var minmax = [getMin(flooding.json, 'FDATE'), getMax(flooding.json, 'FDATE')];
                            $('#' + tempid + '_flooded_time').slider({
                                range: true,
                                min: minmax[0],
                                max: minmax[1],
                                values: minmax,
                                slide: function (event, ui) {
                                    updateFlooded(tempid, leafmap, flooding, 'FD_DEPTH', 'FDATE', [ui.values[0], ui.values[1]], "mm");

                                    $('#' + tempid + '_flooded_info').val(parseInt(ui.values[0] / 10000) + " - " + parseInt(ui.values[1] / 10000));
                                }
                            });
                            $('#' + tempid + '_flooded_info').val(parseInt(minmax[0] / 10000) + " - " + parseInt(minmax[1] / 10000));
                        });
                        break;
                    case 'circle':
                        html += '<li> Colors: <input type = "color" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'color" value = "#FF0000" onchange="updateCircle(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ',' + "'" + data[key]['使用欄位'] + "'" + ')"/></li>'
                        break;
                    case 'youbike':
                        //                        html += '<li>Range:<input type="number" id="' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'range" class="clean short small-input" value="500" step="10" style="color: blue;" onchange="updateYoubike(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ",'" + data[key]['ICON'] + "'" + ')"/></li><li>Opacity: <input type = "range" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'opacity"  class = "clean short small-input" max = "100" min = "0" value = "80" style = "color: blue;" onchange="updateYoubike(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ",'" + data[key]['ICON'] + "'" + ')"/></li><li> Colors: <input type = "color" id = "' + data[key]['ID'] + '_' + data[key]['呈現方法1'] + '_' + 'color" value = "#DFE3AB" onchange="updateYoubike(' + data[key]['ID'] + ',leafmap' + ',' + data[key]['程式資料命名'] + ",'" + data[key]['ICON'] + "'" + ')"/><li>';
                    default:
                };
                html += '</ul></li>';
            };
        };
        document.getElementById(divid).innerHTML = html;
    };
};

var legend = L.control({
    position: 'bottomright'
});
var dataarr = [];

function initialize(id, map, data, layer_name, legend, urlname = "datas/datalist.csv") {
    if (!loadCSV(urlname)) {
        console.log('failed.');
        return false;
    } else {
        var result = JSON.parse(csvJSON(loadCSV(urlname)));
        var list;
        for (var i in result) {
            if (result[i]['程式資料命名'] == layer_name && result[i]['ID'] == id) list = result[i];
        }
        if (list['最終使用'] == 1) {
            data.name = list['使用圖層(簡化)'];
            data.unit = list['單位'];
            data.infounit = list['資訊單位欄位'];
            data.infovalue = list['資訊值欄位'];
            data.info_column = list['資訊欄位'];
            data.value_column = list['使用欄位'];
            switch (list['呈現方法1']) {
                case 'heat':
                    updateHeat(list['ID'], map, data, list['使用欄位']);
                    break;
                case 'choropleth':
                    updateChoropleth(list['ID'], map, data, list['使用欄位']);
                    break;
                case 'soil':
                    updateSoil(list['ID'], map, data);
                    break;
                case 'category':
                    updateCategory(list['ID'], map, data, list['使用欄位']);
                    break;
                case 'buffer':
                    updateBuffer(list['ID'], map, data, list['ICON']);
                    break;
                case 'tile':
                    addLayer(map, park.layer);
                    break;
                case 'color':
                    updateColor(list['ID'], map, data, list['使用欄位']);
                    break;
                case 'cluster':
                    updateCluster(list['ID'], map, data, list['使用欄位']);
                    break;
                case 'flooded':
                    updateFlooded(list['ID'], map, data, list['使用欄位'], list['資訊值欄位2'], [$('#' + list['ID'] + '_flooded_time').slider("values", 0), $('#' + list['ID'] + '_flooded_time').slider("values", 1)], list['單位']);
                    break;
                case 'circle':
                    updateCircle(list['ID'], map, data, list['使用欄位']);
                    break;
                case 'youbike':
                    updateYoubike(list['ID'], map, data, list['使用欄位']);
                    break;
                default:
            };
            //alert(data.name);
            dataarr[parseInt(list['ID']) - 1] = data;
            if (map.hasLayer(district.layer)) {
                district.layer.bringToFront();
            } else if (map.hasLayer(town.layer)) {
                town.layer.bringToFront();
            };
            return true;
        };
    };
};

function destroyed(map) {
    removeDataLayer(map, crime_home);
    removeDataLayer(map, crime_car);
    removeDataLayer(map, accident);
    removeDataLayer(map, flooding);
    removeDataLayer(map, soil_liq);
    removeDataLayer(map, pollution);
    removeDataLayer(map, hospital);
    removeDataLayer(map, oilgas);
    removeDataLayer(map, school);
    removeDataLayer(map, park);
    removeDataLayer(map, population);
    removeDataLayer(map, salary);
    removeDataLayer(map, bus_stop);
    removeDataLayer(map, mrt_stop);
    removeDataLayer(map, mrt_route);
    removeDataLayer(map, youbike);
};